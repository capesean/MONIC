IF EXISTS(SELECT * FROM SYSOBJECTS WHERE XTYPE = 'P' AND NAME = 'Calculate')
	DROP PROC Calculate
GO
IF EXISTS(SELECT * FROM SYSOBJECTS WHERE XTYPE = 'P' AND NAME = 'RunCalculations')
	DROP PROC RunCalculations
GO
IF EXISTS(SELECT * FROM SYSOBJECTS WHERE XTYPE = 'P' AND NAME = 'SaveData')
	DROP PROC SaveData
GO
IF EXISTS(SELECT * FROM SYSOBJECTS WHERE XTYPE = 'P' AND NAME = 'Aggregate')
	DROP PROC Aggregate
GO
IF EXISTS(SELECT * FROM sys.types WHERE NAME = 'CalculateTokens')
	DROP TYPE CalculateTokens
GO
IF EXISTS(SELECT * FROM sys.types WHERE NAME = 'GuidIds')
	DROP TYPE GuidIds
GO
IF EXISTS(SELECT * FROM sys.types WHERE NAME = 'DataParam')
	DROP TYPE DataParam
GO
CREATE TYPE CalculateTokens
	AS TABLE 
	(
		IndicatorId uniqueidentifier NOT NULL,
		TokenNumber int NOT NULL,
		TokenType tinyint NOT NULL,
		Number decimal(20,8) NULL,
		OperatorType tinyint NULL,
		ConvertNullToZero bit NULL,
		SourceIndicatorId uniqueidentifier NULL,
		RequiresSubmit bit NULL, --todo: implement this!
		PRIMARY KEY (IndicatorId, TokenNumber)
	);
GO
CREATE TYPE GuidIds
	AS TABLE 
	(
		Id uniqueidentifier NOT NULL
		PRIMARY KEY (Id)
	);
GO
CREATE TYPE DataParam
	AS TABLE 
	(
		SourceIndicatorId uniqueidentifier NOT NULL,
		EntityId uniqueidentifier NOT NULL,
		DateId uniqueidentifier NOT NULL,
		Value decimal(20,8) NULL,
		Note nvarchar(250) NULL,
		[Delete] bit NOT NULL
		PRIMARY KEY (SourceIndicatorId, EntityId, DateId)
	);
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[Calculate]
	@Tokens dbo.CalculateTokens READONLY,
	@IndicatorId uniqueidentifier,
	@UserId uniqueidentifier,
	@EntityIds dbo.GuidIds READONLY,
	@DateIds dbo.GuidIds READONLY
AS
SET NOCOUNT ON;

-- todo: requires submit & approve param
-- todo: transactions (no transaction needed as only 1 data-modifying statement?)

IF NOT EXISTS(SELECT * FROM @EntityIds)
BEGIN;
	THROW 51000, 'No Entity Ids were passed to Calculate proc', 1;
	RETURN
END

IF NOT EXISTS(SELECT * FROM @DateIds)
BEGIN;
	THROW 51000, 'No Date Ids were passed to Calculate proc', 1;
	RETURN
END

-- enums & variables
DECLARE	@TokenType_Indicator tinyint = 0,
        @TokenType_Number tinyint = 1,
        @TokenType_Operator tinyint = 2,
        @TokenType_Parenthesis tinyint = 3,
		@OperatorType_Add tinyint = 0,
        @OperatorType_Subtract tinyint = 1,
        @OperatorType_Multiply tinyint = 2,
        @OperatorType_Divide tinyint = 3,
		@error nvarchar(250),
		@TokenNumber int = 0

IF EXISTS(SELECT * FROM @Tokens WHERE TokenType = @TokenType_Indicator AND (SourceIndicatorId IS NULL OR SourceIndicatorId NOT IN (SELECT SourceIndicatorId FROM Indicators)))
BEGIN;
	SET @error = 'Invalid Indicator';
	THROW 51000, @error, 1;
	RETURN
END

CREATE TABLE #stack (
    TokenNumber int NOT NULL,
	EntityId uniqueidentifier NOT NULL,
    DateId uniqueidentifier NOT NULL,
    Value decimal(20,8) NULL,
	Note nvarchar(250) NULL,
	PRIMARY KEY (TokenNumber, EntityId, DateId)
);

CREATE TABLE #keys (
	EntityId uniqueidentifier NOT NULL,
    DateId uniqueidentifier NOT NULL
	PRIMARY KEY (EntityId, DateId)
);

INSERT INTO #keys
-- get the entities at the frequency entityType
SELECT	e.EntityId, DateID
FROM	Indicators i
CROSS JOIN Entities e
CROSS JOIN Dates d
INNER JOIN @DateIds dateFilter ON d.DateId = dateFilter.Id
INNER JOIN @EntityIds entityFilter ON e.EntityId = entityFilter.Id
WHERE	i.IndicatorId = @IndicatorId
--AND		i.EntityTypeId = e.EntityTypeId
AND		d.DateType <= i.Frequency
/* 2020/10/08: changed: caller of this proc needs to pass in the entityIds of ALL entities
   for which the calc needs to run at. otherwise, removing an entityLink passes in (say) just
   the company that a scheme was removed from, versus the SaveData which passes in the scheme that was edited.
   EntityLink then incudes the country (higher entity levels for the company/entitylink), when recalc for that is not needed
   because the entity is still potentially linked to those entities and their data therefore doesn't need to change
*/ 
--UNION 
-- get the entities that are parents of the frequency entityType
--SELECT	el.ParentEntityId, DateID
--FROM	Indicators i
--CROSS JOIN Entities e
--INNER JOIN EntityLinks el ON e.EntityId = el.ChildEntityId
--CROSS JOIN Dates d
--INNER JOIN @DateIds dateFilter ON d.DateId = dateFilter.Id
--INNER JOIN @EntityIds entityFilter ON e.EntityId = entityFilter.Id
--WHERE	i.IndicatorId = @IndicatorId
--AND		i.EntityTypeId = e.EntityTypeId
--AND		d.DateType <= i.Frequency

WHILE EXISTS(SELECT * FROM @Tokens WHERE TokenNumber > @TokenNumber)
BEGIN

	DECLARE 
		@TokenType tinyint,
		@ParenthesisType bit,
		@Number decimal(20,8),
		@OperatorType tinyint,
		@ConvertNullToZero bit,
		@SourceIndicatorId uniqueidentifier,
		@RequiresSubmit bit
	
	-- get the next token
	SELECT TOP 1 
		@TokenNumber = TokenNumber,
		@TokenType = TokenType,
		@Number = Number,
		@OperatorType = OperatorType,
		@ConvertNullToZero = ConvertNullToZero,
		@SourceIndicatorId = SourceIndicatorId,
		@RequiresSubmit = RequiresSubmit
	FROM	@Tokens
	WHERE	TokenNumber > @TokenNumber
	ORDER BY TokenNumber

	IF @TokenType = @TokenType_Number
	BEGIN
		
		INSERT 
		INTO	#stack
		SELECT	@TokenNumber,
				k.EntityId,
				k.DateId,
				@Number AS Value,
				NULL AS Note
		FROM	#keys k

	END
	ELSE IF @TokenType = @TokenType_Indicator
	BEGIN

		INSERT 
		INTO	#stack
		SELECT	@TokenNumber,
				k.EntityId,
				k.DateId,
				CASE WHEN @ConvertNullToZero = 1 AND Data.Value IS NULL THEN 0 ELSE Data.Value END AS Value,
				CASE WHEN @ConvertNullToZero = 0 AND Data.Value IS NULL THEN 'Null value in data' ELSE NULL END AS Note
		FROM	#keys k
		LEFT JOIN Data
			ON		k.EntityId = Data.EntityId
			AND		k.DateId = Data.DateId
			AND		Data.IndicatorId = @SourceIndicatorId

	END
	ELSE IF @TokenType = @TokenType_Operator
	BEGIN

		DECLARE		@TokenNumber_s1 int = NULL
		DECLARE		@TokenNumber_s2 int = NULL

		-- 'pop' the top value
		SELECT  TOP 1 @TokenNumber_s1 = TokenNumber
		FROM	#stack
		WHERE	TokenNumber < @TokenNumber
		ORDER BY TokenNumber DESC

		-- validate top item
		IF @TokenNumber_s1 IS NULL
		BEGIN
			SET @error = 'Invalid Formula: missing top token to apply operator at position ' + CONVERT(varchar(100), @TokenNumber);
			THROW 51000, @error, 1;
			RETURN
		END

		-- 'pop' the second-top value
		SELECT  TOP 1 @TokenNumber_s2 = TokenNumber
		FROM	#stack
		WHERE	TokenNumber < @TokenNumber_s1
		ORDER BY TokenNumber DESC

		-- validate second-top item
		IF @TokenNumber_s2 IS NULL
		BEGIN
			SET @error = 'Invalid Formula: missing next token to apply operator at position ' + CONVERT(varchar(100), @TokenNumber);
			THROW 51000, @error, 1;
			RETURN
		END

		IF @OperatorType = @OperatorType_Add OR @OperatorType = @OperatorType_Subtract OR @OperatorType = @OperatorType_Multiply OR @OperatorType = @OperatorType_Divide
		BEGIN

			INSERT
			INTO	#stack
			SELECT	@TokenNumber,
					s1.EntityId,
					s1.DateId,
					-- only the top item could/should have an error (from an earlier operation)
					CASE WHEN s1.Note IS NOT NULL THEN NULL ELSE 
						CASE
							WHEN @OperatorType = @OperatorType_Add THEN s2.Value + s1.Value
							WHEN @OperatorType = @OperatorType_Subtract THEN s2.Value - s1.Value
							WHEN @OperatorType = @OperatorType_Multiply THEN s2.Value * s1.Value
							WHEN @OperatorType = @OperatorType_Divide THEN
								CASE WHEN s1.Value = 0 THEN NULL ELSE s2.Value / s1.Value END
						END
					END AS Value,
					CASE WHEN s1.Note IS NOT NULL THEN s1.Note ELSE
						CASE 
							WHEN @OperatorType = @OperatorType_Divide AND s1.Value = 0 THEN 'Divide by Zero'
							WHEN s1.Value IS NULL OR s2.Value IS NULL THEN 'Null value in data'
							ELSE NULL
						END
					END AS Note
			FROM	#stack s1
			JOIN	#stack s2
			ON		s1.EntityId = s2.EntityId
			AND		s1.DateId = s2.DateId
			WHERE	s1.TokenNumber = @TokenNumber_s1
			AND		s2.TokenNumber = @TokenNumber_s2

		END
		ELSE
		BEGIN
			SET @error = 'Invalid Operator Type at position ' + CONVERT(varchar(100), @TokenNumber);
			THROW 51000, @error, 1;
			RETURN
		END

		DELETE
		FROM	#stack
		WHERE	TokenNumber IN (@TokenNumber_s1, @TokenNumber_s2)

	END
	ELSE
	BEGIN

		-- token types can only be numbers, indicators or operators
		SET @error = 'Invalid Token Type at position ' + CONVERT(varchar(100), @TokenNumber);
		THROW 51000, @error, 1;
		RETURN
	
	END

END

IF EXISTS(SELECT * FROM #stack WHERE TokenNumber <> @TokenNumber) 
	OR NOT EXISTS(SELECT * FROM #stack WHERE TokenNumber = @TokenNumber)
BEGIN

	-- invalid: end of formula should have just the result of the last token/operation (which should have been an operator)
	SET @error = 'Invalid formula: expecting the final Infix operation to result in one stack item. IndicatorId: ' + CONVERT(varchar(50), @IndicatorId);
	THROW 51000, @error, 1;
	RETURN

END

;WITH f AS (
		SELECT		d.* 
		FROM		Data d
		INNER JOIN	#keys k
		ON			d.EntityId = k.EntityId
		AND			d.DateId = k.DateId
		WHERE		IndicatorId = @IndicatorId
	)
MERGE	f
USING	#stack w
ON		f.EntityId = w.EntityId
AND		f.DateId = w.DateId
WHEN MATCHED THEN
    UPDATE SET 
        f.Value = w.Value,
        f.Note = w.Note,
		f.LastSavedDateUtc = GETUTCDATE(),
		f.LastSavedById = @UserId
WHEN NOT MATCHED BY TARGET THEN
    INSERT (IndicatorId, EntityId, DateId, Value, Note, LastSavedDateUtc, LastSavedById, Aggregated)
    VALUES (@IndicatorId, w.EntityId, w.DateId, w.Value, w.Note, GETUTCDATE(), @UserId, 0)
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;
	
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[RunCalculations]
	@Tokens dbo.CalculateTokens READONLY,
	@EntityIds dbo.GuidIds READONLY,
	@DateIds dbo.GuidIds READONLY,
	@UserId uniqueidentifier
AS
SET NOCOUNT ON;
SET XACT_ABORT ON; -- protect against client timeouts

/*
	This is the calculation part. 
		
	For each indicator that has an indicator token that has been modified, we will need to (re)calculate that indicator.
	The affected indicators have been determined by the calling app, and the @tokens param has the postfix tokens for all of them.

	Determine which dates & entities to run for, and then call the Calculate proc.

*/
BEGIN TRY
	BEGIN TRANSACTION

	DECLARE		@IndicatorId uniqueidentifier

	DECLARE cursorIndicators CURSOR LOCAL STATIC READ_ONLY FORWARD_ONLY
	FOR 
	SELECT		DISTINCT 
				IndicatorId
	FROM		@Tokens

	OPEN cursorIndicators
	FETCH NEXT FROM cursorIndicators INTO @IndicatorId

	DECLARE		@IndicatorTokens CalculateTokens,
				@IndicatorDateIds GuidIds,
				@IndicatorEntityIds GuidIds

	WHILE @@FETCH_STATUS = 0
	BEGIN
	
		DELETE 
		FROM		@IndicatorTokens

		DELETE 
		FROM		@IndicatorDateIds

		DELETE 
		FROM		@IndicatorEntityIds

		INSERT 
		INTO		@IndicatorTokens
		SELECT		*
		FROM		@Tokens
		WHERE		IndicatorId = @IndicatorId

		INSERT 
		INTO		@IndicatorDateIds
		SELECT		DISTINCT da.Id
		FROM		Indicators i
		CROSS JOIN	@DateIds da
		INNER JOIN	Dates dates 
		ON			da.Id = dates.DateId
		WHERE		i.IndicatorId = @IndicatorId
		-- only run Calculate at the frequency or above (lower value)
		AND			dates.DateType <= i.Frequency

		-- all entities passed in, that are the reporting entity type for this indicator
		INSERT 
		INTO		@IndicatorEntityIds
		SELECT		e.Id
		FROM		Indicators i
		INNER JOIN	Entities en
		ON			i.EntityTypeId = en.EntityTypeId
		INNER JOIN	@EntityIds e
		ON			en.EntityId = e.Id
		WHERE		i.IndicatorId = @IndicatorId
		UNION
		-- plus: all entities passed in, that are a parent of the reporting entity type for this indicator
		SELECT		e.Id
		FROM		Indicators i
		INNER JOIN	Entities en
		ON			i.EntityTypeId = en.EntityTypeId
		INNER JOIN	EntityLinks enl
		ON			enl.ChildEntityId = en.EntityId
		INNER JOIN	@EntityIds e
		ON			enL.ParentEntityId = e.Id
		WHERE		i.IndicatorId = @IndicatorId

		-- use these to persist params if needing to debug an error. Can then load the params within Calculate from these tables
		--select * into IndicatorTokens from @IndicatorTokens
		--select * into IndicatorEntityIds from @IndicatorEntityIds
		--select * into IndicatorDateIds from @IndicatorDateIds

		IF EXISTS(SELECT * FROM @IndicatorEntityIds)
			AND EXISTS(SELECT * FROM @IndicatorDateIds)
		BEGIN
			
			EXEC Calculate @IndicatorTokens, @IndicatorId, @UserId, @IndicatorEntityIds, @IndicatorDateIds

		END

		FETCH NEXT FROM cursorIndicators INTO @IndicatorId
	END

	CLOSE cursorIndicators
	DEALLOCATE cursorIndicators

	COMMIT

END TRY
BEGIN CATCH

	IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
	THROW;

END CATCH
GO

CREATE PROC [dbo].[SaveData]
	@Data dbo.DataParam READONLY, -- todo: should be list of indicatorId+value+note, and separate param for dateid & entityId - so you can't send different dates/entities
	@UserId uniqueidentifier
AS
SET NOCOUNT ON;
SET XACT_ABORT ON; -- protect against client timeouts

---- todo: submit, approve? calculate on save? calculate on submit/approve?

BEGIN TRY
	BEGIN TRANSACTION

	;WITH target AS (
			SELECT		target.* 
			FROM		Data target
			INNER JOIN	@Data source
			ON			target.IndicatorId = source.SourceIndicatorId
			AND			target.EntityId = source.EntityId
			AND			target.DateId = source.DateId
		)
	MERGE	target
	USING	
		(
		SELECT		*
		FROM		@Data
		WHERE		[Delete] = 0
		)
		source
	ON		target.IndicatorId = source.SourceIndicatorId
	AND		target.EntityId = source.EntityId
	AND		target.DateId = source.DateId
	AND		source.[Delete] = 0

	WHEN MATCHED THEN
		UPDATE SET 
			target.Value = source.Value,
			target.Note = source.Note,
			target.LastSavedDateUtc = GETUTCDATE(),
			target.LastSavedById = @UserId

	WHEN NOT MATCHED BY TARGET THEN
		INSERT (IndicatorId, EntityId, DateId, Value, Note, LastSavedDateUtc, LastSavedById, Aggregated)
		VALUES (source.SourceIndicatorId, source.EntityId, source.DateId, source.Value, source.Note, GETUTCDATE(), @UserId, 0)

	WHEN NOT MATCHED BY SOURCE THEN
		DELETE;

	COMMIT

END TRY
BEGIN CATCH

	IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
	THROW;

END CATCH
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [dbo].[Aggregate]
	@IndicatorIds dbo.GuidIds READONLY,
	@EntityIds dbo.GuidIds READONLY,
	@DateIds dbo.GuidIds READONLY,
	@UserId uniqueidentifier
AS
SET NOCOUNT ON;
SET XACT_ABORT ON; -- protect against client timeouts

/* --- EXPLAINER FOR AGGREGATION LOGIC: -----------------------------

There are 2 basic steps that aggregation will occur in: 
   (A) source entities up the date hierarchy, and then 
   (B) source entities to higher entities

Suppose you are capturing data at Scheme & Month, and there is a higher entity Cluster, and a higher date Year; you have this situation (matrix):

			|	DATE:		DATE:
ENTITY:		|  MONTH		YEAR	
---------------------------------
SCHEME		|     X   --->   A
			|     |          |
			|     v          v
CLUSTER		|     B1         B2

Steps:
	[X] Data entry (non-aggregated data)
	[A] Aggregate by Date: from the source entity type & date, aggregate to higher level dates. This can be a SUM or MOST RECENT aggregation.
	[B 1&2] Aggregate by Entity: This is always a SUM aggregation, from the source entity type to higher entity types.

*/

BEGIN TRY
	BEGIN TRANSACTION
	
	DECLARE @AggregationType_SUM tinyint = 0,
			@AggregationType_MOSTRECENT tinyint = 1,
			@DateType_YEAR tinyint = 0,
			@DateType_QUARTER tinyint = 1,
			@DateType_MONTH tinyint = 2,
			@step nvarchar(100)

	-- this table param stores all the values that will be used in various filters during aggregation
	DECLARE @filters TABLE (
		SourceIndicatorId uniqueidentifier NOT NULL,
		EntityId uniqueidentifier NOT NULL,
		DateId uniqueidentifier NOT NULL,
		Frequency int NOT NULL,
		DateAggregationType int NOT NULL,
		IndicatorEntityTypeId uniqueidentifier NOT NULL,
		EntityEntityTypeId uniqueidentifier NOT NULL,
		DateType int NOT NULL,
		QuarterId uniqueidentifier NULL,
		YearId uniqueidentifier NULL,
		SortOrder int NOT NULL
		PRIMARY KEY (SourceIndicatorId, EntityId, DateId)
	);

	-- populate the filters with all the required data
	INSERT 
	INTO		@filters
	SELECT		d.Id, 
				en.Id, 
				da.Id, 
				Frequency, 
				DateAggregationType, 
				si.EntityTypeId, 
				entities.EntityTypeId, 
				dates.DateType, 
				dates.QuarterId, 
				dates.YearId, 
				dates.SortOrder
	FROM		@IndicatorIds d
	CROSS JOIN	@EntityIds en
	CROSS JOIN	@DateIds da
	INNER JOIN	Indicators si ON d.Id = si.IndicatorId
	INNER JOIN	Entities entities ON en.Id = entities.EntityId
	INNER JOIN	Dates dates ON da.Id = dates.DateId

	-----------------------------------------------------------------------------------------------------------------------------------------------------

	SET @step = 'AGGREGATE.DATE(MOSTRECENT)->Q'

	-- a) populate temp table
	;WITH cte AS 
	(
		SELECT		d.IndicatorId,
					d.EntityId, 			-- keep entity fixed
					f.DateId,				-- aggregate to quarter
					d.Value, 
					ROW_NUMBER() OVER (
						PARTITION BY 
							f.SourceIndicatorId, 
							f.EntityId, 
							f.DateId		-- partition/GROUP BY quarter
						ORDER BY 
							da.SortOrder DESC -- most recent will have row = 1
					) as RowNumber
		FROM		Data d
		INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId
		INNER JOIN	Entities en on d.EntityId = en.EntityId
		INNER JOIN	Dates da on d.DateId = da.DateId
		WHERE		f.DateAggregationType = @AggregationType_MOSTRECENT
		AND			f.Frequency = @DateType_MONTH
		AND			f.DateType = @DateType_QUARTER
		AND			da.QuarterId = f.DateId
		AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
		AND			d.Aggregated = 0
		AND			d.Value IS NOT NULL -- todo: maybe a setting on the indicator to determine if nulls should be overlooked or not?
	)
	SELECT		IndicatorId,
				EntityId, 
				DateId, 
				Value
	INTO		#mostrecent_q
	FROM		cte
	-- filter to the most recent record only (date.sortOrder Descending) - see inner row_number()
	WHERE		RowNumber = 1;

	-- b) apply from temp table to data table
	;WITH	d 
	AS (
			SELECT		d.*
			FROM		Data d
			INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId AND d.DateId = f.DateId
			INNER JOIN	Entities en on d.EntityId = en.EntityId
			WHERE		Aggregated = 1
			AND			f.DateAggregationType = @AggregationType_MOSTRECENT
			AND			f.Frequency = @DateType_MONTH
			AND			f.DateType = @DateType_QUARTER
			AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
		)
	MERGE	d
	USING	(
		SELECT			*
		FROM			#mostrecent_q
	) source
	ON		d.IndicatorId = source.IndicatorId
	AND		d.EntityId = source.EntityId
	AND		d.DateId = source.DateId
	WHEN MATCHED THEN
		UPDATE SET 
			d.Value = source.Value,
			d.Note = @step,
			d.LastSavedDateUtc = GETUTCDATE(),
			d.LastSavedById = @UserId
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (IndicatorId, EntityId, DateId, Value, Note, Aggregated, LastSavedDateUtc, LastSavedById)
		VALUES (source.IndicatorId, source.EntityId, source.DateId, source.Value, @step, 1, GETUTCDATE(), @UserId)
	WHEN NOT MATCHED BY SOURCE THEN
		DELETE;

	-----------------------------------------------------------------------------------------------------------------------------------------------------

	SET @step = 'AGGREGATE.DATE(MOSTRECENT)->Y'

	-- a) populate temp table
	;WITH cte AS 
	(
		SELECT		d.IndicatorId,
					d.EntityId, 			-- keep entity fixed
					f.DateId,				-- aggregate to year
					d.Value, 
					ROW_NUMBER() OVER (
						PARTITION BY 
							f.SourceIndicatorId, 
							f.EntityId, 
							f.DateId		-- partition/GROUP BY year
						ORDER BY 
							da.SortOrder DESC -- most recent will have row = 1
					) as RowNumber
		FROM		Data d
		INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId
		INNER JOIN	Entities en on d.EntityId = en.EntityId
		INNER JOIN	Dates da on d.DateId = da.DateId
		WHERE		f.DateAggregationType = @AggregationType_MOSTRECENT
		AND			f.Frequency IN (@DateType_MONTH, @DateType_QUARTER)
		AND			f.DateType = @DateType_YEAR
		AND			da.YearId = f.DateId
		AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
		AND			d.Aggregated = 0
		AND			d.Value IS NOT NULL -- todo: maybe a setting on the indicator to determine if nulls should be overlooked or not?
	)
	SELECT		IndicatorId,
				EntityId, 
				DateId, 
				Value
	INTO		#mostrecent_y
	FROM		cte
	-- filter to the most recent record only (date.sortOrder Descending) - see inner row_number()
	WHERE		RowNumber = 1;

	-- b) apply from temp table to data table
	;WITH	d 
	AS (
			SELECT		d.*
			FROM		Data d
			INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId AND d.DateId = f.DateId
			INNER JOIN	Entities en on d.EntityId = en.EntityId
			WHERE		Aggregated = 1
			AND			f.DateAggregationType = @AggregationType_MOSTRECENT
			AND			f.Frequency IN (@DateType_MONTH, @DateType_QUARTER)
			AND			f.DateType = @DateType_YEAR
			AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
		)
	MERGE	d
	USING	(
		SELECT			*
		FROM			#mostrecent_y
	) source
	ON		d.IndicatorId = source.IndicatorId
	AND		d.EntityId = source.EntityId
	AND		d.DateId = source.DateId
	WHEN MATCHED THEN
		UPDATE SET 
			d.Value = source.Value,
			d.Note = @step,
			d.LastSavedDateUtc = GETUTCDATE(),
			d.LastSavedById = @UserId
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (IndicatorId, EntityId, DateId, Value, Note, Aggregated, LastSavedDateUtc, LastSavedById)
		VALUES (source.IndicatorId, source.EntityId, source.DateId, source.Value, @step, 1, GETUTCDATE(), @UserId)
	WHEN NOT MATCHED BY SOURCE THEN
		DELETE;
		
	-----------------------------------------------------------------------------------------------------------------------------------------------------

	SET @step = 'AGGREGATE.DATE(SUM)->Q'

	;WITH	d 
	AS (
			SELECT		d.*
			FROM		Data d
			INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId AND d.DateId = f.DateId
			INNER JOIN	Entities en on d.EntityId = en.EntityId
			WHERE		Aggregated = 1
			AND			f.DateAggregationType = @AggregationType_SUM
			AND			f.Frequency = @DateType_MONTH
			AND			f.DateType = @DateType_QUARTER
			AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
		)
	MERGE	d
	USING	(
			SELECT		d.IndicatorId, 
						d.EntityId, 
						f.DateId, 
						SUM(d.value) Value
			FROM		Data d
			INNER JOIN	Dates da ON d.DateId = da.DateId
			INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId
			WHERE		da.DateType = f.Frequency -- dates that are the collection frequency
			AND			d.Aggregated = 0
			AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
			AND			da.QuarterId = f.DateId
			AND			f.DateAggregationType = @AggregationType_SUM -- 0: sum, 1: most recent
			AND			f.Frequency = @DateType_MONTH
			AND			d.Value IS NOT NULL
			GROUP BY	d.IndicatorId, 
						d.EntityId, 
						f.DateId
	) source
	ON		d.IndicatorId = source.IndicatorId
	AND		d.EntityId = source.EntityId
	AND		d.DateId = source.DateId
	WHEN MATCHED THEN
		UPDATE SET 
			d.Value = source.Value,
			d.Note = @step,
			d.LastSavedDateUtc = GETUTCDATE(),
			d.LastSavedById = @UserId
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (IndicatorId, EntityId, DateId, Value, Note, Aggregated, LastSavedDateUtc, LastSavedById)
		VALUES (source.IndicatorId, source.EntityId, source.DateId, source.Value, @step, 1, GETUTCDATE(), @UserId)
	WHEN NOT MATCHED BY SOURCE THEN
		DELETE;

	-----------------------------------------------------------------------------------------------------------------------------------------------------

	SET @step = 'AGGREGATE.DATE(SUM)->Y'

	;WITH	d 
	AS (
			SELECT		d.*
			FROM		Data d
			INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId AND d.DateId = f.DateId
			INNER JOIN	Entities en on d.EntityId = en.EntityId
			-- targeting: Aggregated Year data for indicators that are MostRecentSUMs collected at Month/Quarter at the collection entity type
			WHERE		Aggregated = 1
			AND			f.DateAggregationType = @AggregationType_SUM
			AND			f.Frequency IN (@DateType_MONTH, @DateType_QUARTER)
			AND			f.DateType = @DateType_YEAR
			AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
		)
	MERGE	d
	USING	(
			SELECT		d.IndicatorId, 
						d.EntityId, 
						f.DateId, 
						SUM(d.value) Value
			FROM		Data d
			INNER JOIN	Dates da ON d.DateId = da.DateId
			INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId
			WHERE		da.DateType = f.Frequency -- dates that are the collection frequency
			AND			d.Aggregated = 0
			AND			f.EntityEntityTypeId = f.IndicatorEntityTypeId
			AND			da.YearId = f.DateId
			AND			f.DateAggregationType = @AggregationType_SUM -- 0: sum, 1: most recent
			AND			f.Frequency IN (@DateType_MONTH, @DateType_QUARTER)
			AND			d.Value IS NOT NULL
			GROUP BY	d.IndicatorId, 
						d.EntityId, 
						f.DateId
	) source
	ON		d.IndicatorId = source.IndicatorId
	AND		d.EntityId = source.EntityId
	AND		d.DateId = source.DateId
	WHEN MATCHED THEN
		UPDATE SET 
			d.Value = source.Value,
			d.Note = @step,
			d.LastSavedDateUtc = GETUTCDATE(),
			d.LastSavedById = @UserId
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (IndicatorId, EntityId, DateId, Value, Note, Aggregated, LastSavedDateUtc, LastSavedById)
		VALUES (source.IndicatorId, source.EntityId, source.DateId, source.Value, @step, 1, GETUTCDATE(), @UserId)
	WHEN NOT MATCHED BY SOURCE THEN
		DELETE;

	-----------------------------------------------------------------------------------------------------------------------------------------------------

	SET @step = 'AGGREGATE.ENTITY(SUM)'

	;WITH	d AS ( 
		SELECT		d.*
		FROM		Data d
		INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND d.EntityId = f.EntityId AND d.DateId = f.DateId
		-- restrict to: aggregated data for the same date frequency but different entitytypes
		WHERE		Aggregated = 1
		AND			f.EntityEntityTypeId <> f.IndicatorEntityTypeId
	)
	MERGE	d
	USING	(
		SELECT		f.SourceIndicatorId,
					f.EntityId, 
					f.DateId, 
					SUM(d.Value) Value
		FROM		Data d
		INNER JOIN	Entities en ON d.EntityId = en.EntityId
		INNER JOIN	EntityLinks enL ON d.EntityId = enL.ChildEntityId
		INNER JOIN	@filters f ON d.IndicatorId = f.SourceIndicatorId AND enL.ParentEntityId = f.EntityId AND d.DateId = f.DateId
		-- filter: exclude nulls, non-aggregated (source) data at the level of collection frequency
		WHERE		d.Value IS NOT NULL
		AND			en.EntityTypeId = f.IndicatorEntityTypeId
		AND			f.EntityEntityTypeId <> f.IndicatorEntityTypeId
		GROUP BY	f.SourceIndicatorId,
					f.EntityId, 
					f.DateId
	) source
	ON		d.IndicatorId = source.SourceIndicatorId
	AND		d.EntityId = source.EntityId
	AND		d.DateId = source.DateId
	WHEN MATCHED THEN
		UPDATE SET 
			d.Value = source.Value,
			d.Note = @step,
			d.LastSavedDateUtc = GETUTCDATE(),
			d.LastSavedById = @UserId
	WHEN NOT MATCHED BY TARGET THEN
		INSERT (IndicatorId, EntityId, DateId, Value, Note, Aggregated, LastSavedDateUtc, LastSavedById)
		VALUES (source.SourceIndicatorId, source.EntityId, source.DateId, source.Value, @step, 1, GETUTCDATE(), @UserId)
	WHEN NOT MATCHED BY SOURCE THEN
		DELETE;

	COMMIT

END TRY
BEGIN CATCH

	IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
	THROW;

END CATCH
GO