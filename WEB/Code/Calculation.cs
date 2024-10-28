using WEB.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Data.SqlClient;

namespace WEB
{
    public class Calculation
    {
        private ApplicationDbContext db;
        private AppSettings appSettings;
        private Guid userId;
        private List<Indicator> allIndicators = new List<Indicator>();

        public Calculation(ApplicationDbContext db, AppSettings appSettings, Guid userId)
        {
            this.db = db;
            this.appSettings = appSettings;
            this.userId = userId;
            allIndicators = db.Indicators
                .Include(o => o.Tokens)
                .ThenInclude(o => o.SourceIndicator)
                .ToList();
        }

        public async System.Threading.Tasks.Task SaveAsync(Datum datum)
        {
            await SaveAsync(new List<Datum> { datum });
        }

        public async System.Threading.Tasks.Task SaveAsync(List<Datum> data, bool calculateOnly = false)
        {
            if (calculateOnly) throw new Exception("Not implemented: calculateOnly");

            // todo: the SaveData proc could/should just call the Aggregate and Calculate procs directly?

            // get keys of all data being saved
            var indicatorIds = data.Select(o => o.IndicatorId).Distinct().ToList();
            var entityIds = data.Select(o => o.EntityId).Distinct().ToList();
            var dateIds = data.Select(o => o.DateId).Distinct().ToList();

            var indicators = allIndicators.Where(o => indicatorIds.Contains(o.IndicatorId)).ToList();
            if (indicators.Any(o => o.IndicatorType != IndicatorType.Collected)) throw new Exception("Attempting to save a non-collected indicator");

            var tokenStacks = GetTokenStacksToCalculate(indicatorIds);
            
            // entityIds for agg+calc: current entity + parents
            entityIds.AddRange(await db.EntityLinks.Where(o => entityIds.Contains(o.ChildEntityId)).Select(o => o.ParentEntityId).Distinct().ToListAsync());
            entityIds = entityIds.Distinct().ToList();

            // dateIds for agg+calc: current date + parents
            dateIds.AddRange(db.Dates.Where(o => dateIds.Contains(o.DateId) && o.QuarterId.HasValue).Select(o => o.QuarterId.Value).Distinct().ToList());
            dateIds.AddRange(db.Dates.Where(o => dateIds.Contains(o.DateId) && o.YearId.HasValue).Select(o => o.YearId.Value).Distinct().ToList());
            dateIds = dateIds.Distinct().ToList();

            using var transactionScope = Utilities.General.CreateTransactionScope();

            using (var cmd = db.Database.GetDbConnection().CreateCommand())
            {
                cmd.CommandText = "SaveData";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;

                cmd.Parameters.Add(new SqlParameter("UserId", userId));

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("IndicatorId", typeof(Guid));
                    dataTable.Columns.Add("EntityId", typeof(Guid));
                    dataTable.Columns.Add("DateId", typeof(Guid));
                    dataTable.Columns.Add("Value", typeof(decimal));
                    dataTable.Columns.Add("Note", typeof(string));
                    // todo: remove this param?
                    dataTable.Columns.Add("Delete", typeof(bool));

                    foreach (var datum in data)
                    {
                        dataTable.Rows.Add(
                            datum.IndicatorId, 
                            datum.EntityId, 
                            datum.DateId, 
                            datum.Value, 
                            datum.Note, 
                            // can't mark blank as delete else submitting a blank row results in errors (FK to DataReviews)
                            false//datum.Value == null && string.IsNullOrWhiteSpace(datum.Note)
                            );
                    }

                    var dataParam = new SqlParameter("@Data", dataTable);
                    dataParam.SqlDbType = SqlDbType.Structured;
                    dataParam.TypeName = "dbo.DataParam";
                    cmd.Parameters.Add(dataParam);

                }

                var wasOpen = cmd.Connection.State == ConnectionState.Open;
                if (!wasOpen) cmd.Connection.Open();
                try
                {
                    await cmd.ExecuteNonQueryAsync();
                }
                finally
                {
                    if (!wasOpen) cmd.Connection.Close();
                }
            }

            await AggregateAsync(indicatorIds, entityIds, dateIds);

            if (tokenStacks.Any())
                await CalculateAsync(tokenStacks, entityIds, dateIds);

            transactionScope.Complete();
        }

        // no longer needed?
        //public async Task AggregateAsync(Indicator indicator)
        //{
        //    if (indicator.IndicatorType != IndicatorType.Collected) throw new Exception($"Indicator {indicator.Code} is not a collected indicator");

        //    var childEntityIds = await db.Entities.Where(o => o.EntityTypeId == indicator.EntityTypeId).Select(o => o.EntityId).ToListAsync();
        //    var parentEntityIds = await db.EntityLinks.Where(o => childEntityIds.Contains(o.ChildEntityId)).Select(o => o.ParentEntityId).Distinct().ToListAsync();
        //    var entityIds = childEntityIds.Union(parentEntityIds).ToList();

        //    var collectionDates = await db.Dates.Where(o => o.DateType == indicator.Frequency && o.Data.Any(d => !d.Aggregated && d.Entity.EntityTypeId == indicator.EntityTypeId)).ToListAsync();
        //    var quarterIds = collectionDates.Where(o => o.QuarterId.HasValue).Select(o => o.QuarterId.Value).Distinct();
        //    var yearIds = collectionDates.Where(o => o.YearId.HasValue).Select(o => o.YearId.Value).Distinct();
        //    var dateIds = collectionDates.Select(o => o.DateId).ToList().Union(quarterIds).Union(yearIds);

        //    await AggregateAsync(new List<Guid> { indicator.IndicatorId }, entityIds, dateIds);
        //}

        internal async System.Threading.Tasks.Task AggregateAsync(IEnumerable<Guid> indicatorIds, IEnumerable<Guid> entityIds, IEnumerable<Guid> dateIds)
        {
            // @entityIds: must include all the entities aggregating TO (i.e. parent entity Ids), 
            //             PLUS the entities aggregating FROM (i.e. child entity ids)
            // @dateIds: must include all the dateIds aggregating TO, PLUS the dateIds aggregating FROM

            if (allIndicators.Any(o => indicatorIds.Contains(o.IndicatorId) && o.IndicatorType != IndicatorType.Collected)) throw new Exception("A non-collected indicator was passed to the AggregateAsync function");

            using (var cmd = db.Database.GetDbConnection().CreateCommand())
            {
                cmd.CommandText = "Aggregate";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;

                cmd.Parameters.Add(new SqlParameter("UserId", userId));

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("Id", typeof(Guid));

                    foreach (var indicatorId in indicatorIds)
                    {
                        dataTable.Rows.Add(indicatorId);
                    }

                    var dataParam = new SqlParameter("@IndicatorIds", dataTable);
                    dataParam.SqlDbType = SqlDbType.Structured;
                    dataParam.TypeName = "dbo.GuidIds";
                    cmd.Parameters.Add(dataParam);

                }

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("Id", typeof(Guid));

                    foreach (var EntityId in entityIds)
                    {
                        dataTable.Rows.Add(EntityId);
                    }

                    var dataParam = new SqlParameter("@EntityIds", dataTable);
                    dataParam.SqlDbType = SqlDbType.Structured;
                    dataParam.TypeName = "dbo.GuidIds";
                    cmd.Parameters.Add(dataParam);

                }

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("Id", typeof(Guid));

                    foreach (var DateId in dateIds)
                    {
                        dataTable.Rows.Add(DateId);
                    }

                    var dataParam = new SqlParameter("@DateIds", dataTable);
                    dataParam.SqlDbType = SqlDbType.Structured;
                    dataParam.TypeName = "dbo.GuidIds";
                    cmd.Parameters.Add(dataParam);

                }

                var wasOpen = cmd.Connection.State == ConnectionState.Open;
                if (!wasOpen) cmd.Connection.Open();
                try
                {
                    await cmd.ExecuteNonQueryAsync();
                }
                finally
                {
                    if (!wasOpen) cmd.Connection.Close();
                }
            }
        }

        public async System.Threading.Tasks.Task CalculateAsync(Indicator indicator, List<Guid> entityIds = null, List<Guid> dateIds = null)
        {
            if (!indicator.Tokens.Any()) throw new Exception($"Indicator {indicator.Code} does not have a formula");
            if (indicator.IndicatorType != IndicatorType.Calculated) throw new Exception($"Indicator {indicator.Code} is not a calculated indicator");

            var tokenStacks = new Dictionary<Guid, Stack<TokenStruct>>();
            var stack = GetTokenStack(indicator);
            tokenStacks.Add(stack.Key, stack.Value);
            var indicatorIds = indicator.Tokens.Where(o => o.TokenType == TokenType.Indicator).Select(o => o.SourceIndicatorId.Value).Distinct().ToArray();

            // only get dates where it is at/above the date type, and where there is data for any of the indicators
            if (dateIds == null)
            {
                dateIds = await db.Dates
                    .Where(o => o.DateType <= indicator.Frequency && o.Data.Any(d => indicatorIds.Contains(d.IndicatorId)))
                    .Select(o => o.DateId)
                    .ToListAsync();
            }

            if (entityIds == null)
            {
                // todo: combine this into a single query that returns just the ids
                entityIds = await db.Entities
                    .Where(o => o.EntityTypeId == indicator.EntityTypeId)
                    .Select(o => o.EntityId)
                    .ToListAsync();

                entityIds.AddRange(
                    await db.EntityLinks.Where(o => entityIds.Contains(o.ChildEntityId))
                    .Select(o => o.ParentEntityId)
                    .ToListAsync()
                    );

                entityIds = entityIds.Distinct().ToList();
            }

            await CalculateAsync(tokenStacks, entityIds, dateIds);
        }

        private async System.Threading.Tasks.Task CalculateAsync(Dictionary<Guid, Stack<TokenStruct>> tokenStacks, IEnumerable<Guid> entityIds, IEnumerable<Guid> dateIds)
        {
            if (tokenStacks.Count == 0) throw new Exception("No token stacks were passed to CalculateAsync");

            var dbSettings = appSettings.GetDbSettings(db);

            using (var cmd = db.Database.GetDbConnection().CreateCommand())
            {
                cmd.CommandText = "RunCalculations";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 300;

                cmd.Parameters.Add(new SqlParameter("UserId", userId));

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("Id", typeof(Guid));

                    foreach (var EntityId in entityIds)
                    {
                        dataTable.Rows.Add(EntityId);
                    }

                    var dataParam = new SqlParameter("@EntityIds", dataTable);
                    dataParam.SqlDbType = SqlDbType.Structured;
                    dataParam.TypeName = "dbo.GuidIds";
                    cmd.Parameters.Add(dataParam);

                }

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("Id", typeof(Guid));

                    foreach (var DateId in dateIds)
                    {
                        dataTable.Rows.Add(DateId);
                    }

                    var dataParam = new SqlParameter("@DateIds", dataTable);
                    dataParam.SqlDbType = SqlDbType.Structured;
                    dataParam.TypeName = "dbo.GuidIds";
                    cmd.Parameters.Add(dataParam);

                }

                using (var dataTable = new DataTable())
                {
                    dataTable.Columns.Add("IndicatorId", typeof(Guid));
                    dataTable.Columns.Add("TokenNumber", typeof(int));
                    dataTable.Columns.Add("TokenType", typeof(short));
                    dataTable.Columns.Add("Number", typeof(decimal));
                    dataTable.Columns.Add("OperatorType", typeof(short));
                    dataTable.Columns.Add("ConvertNullToZero", typeof(bool));
                    dataTable.Columns.Add("SourceIndicatorId", typeof(Guid));
                    dataTable.Columns.Add("RequiresSubmit", typeof(bool));

                    foreach (var tokenStack in tokenStacks)
                    {
                        var tokenNumber = 0;
                        foreach (var token in tokenStack.Value)
                        {
                            tokenNumber++;
                            dataTable.Rows.Add(tokenStack.Key, tokenNumber, token.TokenType, token.Number, token.OperatorType, token.ConvertNullToZero, token.IndicatorId, token.RequiresSubmit && dbSettings.UseSubmit);
                        }
                    }

                    var tokens = new SqlParameter("@Tokens", dataTable);
                    tokens.SqlDbType = SqlDbType.Structured;
                    tokens.TypeName = "dbo.CalculateTokens";
                    cmd.Parameters.Add(tokens);
                }

                var wasOpen = cmd.Connection.State == ConnectionState.Open;
                if (!wasOpen) cmd.Connection.Open();
                try
                {
                    await cmd.ExecuteNonQueryAsync();
                }
                finally
                {
                    if (!wasOpen) cmd.Connection.Close();
                }
            }
        }

        // note: indicatorIds is the list of indicators that have modified collected/aggregated data. This function will return the token stacks
        // for the indicators that are affected by those changes
        private Dictionary<Guid, Stack<TokenStruct>> GetTokenStacksToCalculate(IEnumerable<Guid> indicatorIds)
        {
            var stacks = new Dictionary<Guid, Stack<TokenStruct>>();

            // determine all the indicators that need to be calculated
            var indicatorsToCalculate = allIndicators
                .Where(o => o.IndicatorType == IndicatorType.Calculated)
                .Where(o => o.Tokens.Any(t => t.TokenType == TokenType.Indicator && t.SourceIndicatorId.HasValue && indicatorIds.Contains(t.SourceIndicatorId.Value)))
                .ToList();

            foreach (var indicator in indicatorsToCalculate)
            {
                if (!indicator.Tokens.Any()) throw new Exception($"Indicator {indicator.Code} does not have a formula");

                if (!stacks.ContainsKey(indicator.IndicatorId))
                {
                    var kvp = GetTokenStack(indicator);
                    stacks.Add(kvp.Key, kvp.Value);
                }
            }

            return stacks;
        }

        private KeyValuePair<Guid, Stack<TokenStruct>> GetTokenStack(Indicator indicator)
        {
            return new KeyValuePair<Guid, Stack<TokenStruct>>(indicator.IndicatorId, ToPostFixStack(indicator));
        }

        public async System.Threading.Tasks.Task ChangeEntityLinkAsync(EntityLink entityLink, EntityLinkChangeType changeType)
        {
            List<Guid> indicatorIdsToAggregate = null;
            //List<Guid> indicatorIds = null;
            List<Date> dates = null;

            using var transactionScope = Utilities.General.CreateTransactionScope();

            if (changeType == EntityLinkChangeType.Remove)
            {
                // REMOVING an entity link between a parent & a child entity:
                // AGGREGATION: any aggregated data for the parent, will need to be re-aggregated to exclude the child

                db.Entry(entityLink).State = EntityState.Deleted;

                await Permissions.RemoveOversightEntityPermissionsAsync(db, appSettings, entityLink);

                indicatorIdsToAggregate = await db.Data.Where(
                        // filter to the parent entity's Id
                        o => o.EntityId == entityLink.ParentEntityId
                        // not necessary?
                        && o.Aggregated
                        // for indicators that are collected
                        && o.Indicator.IndicatorType == IndicatorType.Collected
                        // for indicators that are not collected for this entity type
                        && o.Indicator.EntityTypeId != o.Entity.EntityTypeId
                        )
                    .Select(o => o.IndicatorId)
                    .Distinct()
                    .ToListAsync();

                // get all dates that have been aggregated for the parent, plus any dates 'above' those
                dates = await db.Data.Where(o => o.EntityId == entityLink.ParentEntityId && o.Aggregated)
                    .Select(o => o.Date)
                    .Distinct()
                    .ToListAsync();
            }
            else
            {
                // ADDING an entity link between a parent & a child entity: 
                // AGGREGATION: any collected indicators that apply to the child, will need to be aggregated to the parent

                db.Entry(entityLink).State = EntityState.Added;

                await Permissions.AddOversightEntityPermissionsAsync(db, appSettings, entityLink);

                indicatorIdsToAggregate = await db.Data.Where(
                    // filter to the child entity's Id
                    o => o.EntityId == entityLink.ChildEntityId
                    // not necessary?
                    && !o.Aggregated
                    // for indicators that are collected
                    && o.Indicator.IndicatorType == IndicatorType.Collected
                    // for indicators that are collected for this entity type
                    && o.Indicator.EntityTypeId == o.Entity.EntityTypeId
                    )
                    .Select(o => o.IndicatorId)
                    .Distinct()
                    .ToListAsync();

                // get all dates that have been entered (not aggregated) for the child, plus any dates 'above' those
                dates = await db.Data.Where(o => o.EntityId == entityLink.ChildEntityId && !o.Aggregated)
                    .Select(o => o.Date)
                    .Distinct()
                    .ToListAsync();
            }

            var tokenStacks = GetTokenStacksToCalculate(indicatorIdsToAggregate);

            // get the dates selected plus the 'parents' of those
            var dateIds = dates.Select(o => o.DateId).ToList();
            foreach (var dateId in dates.Where(o => o.QuarterId.HasValue).Select(o => o.QuarterId.Value).Distinct())
                if (!dateIds.Contains(dateId)) dateIds.Add(dateId);
            foreach (var dateId in dates.Where(o => o.YearId.HasValue).Select(o => o.YearId.Value).Distinct())
                if (!dateIds.Contains(dateId)) dateIds.Add(dateId);

            // save the entityLink change
            await db.SaveChangesAsync();

            await AggregateAsync(indicatorIdsToAggregate, new List<Guid> { entityLink.ParentEntityId }, dateIds);

            if (tokenStacks.Any())
                await CalculateAsync(tokenStacks, new List<Guid> { entityLink.ParentEntityId }, dateIds);

            transactionScope.Complete();
        }

        private static Stack<TokenStruct> ToPostFixStack(Indicator indicator)
        {
            var tokens = indicator.Tokens.OrderBy(o => o.TokenNumber);

            // get the tokens from the infix stack
            var tempStack = new Stack<Token>(tokens);
            var newStack = new Stack<Token>();
            while (tempStack.Count > 0) newStack.Push(tempStack.Pop());

            // temporary stacks
            var output = new Stack<TokenStruct>();
            var operators = new Stack<TokenStruct>();

            while (newStack.Count > 0)
            {
                var currentToken = newStack.Pop();

                // if it's an operator
                if (currentToken.TokenType == TokenType.Operator)
                {
                    var associativeness = currentToken.Associativeness;
                    var precedence = currentToken.Precedence;

                    // move precedent operators to output
                    while (operators.Count > 0 && operators.Peek().TokenType == TokenType.Operator)
                    {
                        var nextOperator = operators.Peek();

                        if ((associativeness == Associativeness.Left &&
                             precedence <= nextOperator.Precedence)
                            ||
                            (associativeness == Associativeness.Right &&
                             precedence < nextOperator.Precedence))
                        {
                            if (operators.Count == 0) throw new ArgumentException("Invalid formula: missing operator");
                            output.Push(operators.Pop());
                        }
                        else
                        {
                            break;
                        }
                    }
                    // add to operators
                    operators.Push(new TokenStruct
                    {
                        TokenType = currentToken.TokenType,
                        OperatorType = currentToken.OperatorType,
                        Precedence = precedence
                    });
                }
                // if it's a bracket
                else if (currentToken.TokenType == TokenType.Parenthesis)
                {
                    switch (currentToken.ParenthesisType)
                    {
                        // if it's an opening bracket, add it to operators
                        case ParenthesisType.Open:
                            operators.Push(new TokenStruct
                            {
                                TokenType = TokenType.Parenthesis,
                                ParenthesisType = ParenthesisType.Open
                            });
                            break;
                        // if it's a closing bracket
                        case ParenthesisType.Close:
                            // shift operators in between opening to output 
                            while (operators.Count > 0)
                            {
                                var nextOperator = operators.Peek();
                                if (nextOperator.TokenType == TokenType.Parenthesis
                                    && nextOperator.ParenthesisType == ParenthesisType.Open) break;
                                if (operators.Count == 0) throw new ArgumentException("Invalid formula: missing parenthesis");
                                output.Push(operators.Pop());
                            }
                            // add to operators
                            if (operators.Count == 0) throw new ArgumentException("Invalid formula: missing parenthesis");
                            operators.Pop();
                            break;
                    }
                }
                // if it's numeric (or equivalent), add to output
                else if (currentToken.TokenType == TokenType.Number || currentToken.TokenType == TokenType.Indicator)
                {
                    output.Push(new TokenStruct
                    {
                        TokenType = currentToken.TokenType,
                        Number = currentToken.Number,
                        ConvertNullToZero = currentToken.ConvertNullToZero,
                        IndicatorId = currentToken.SourceIndicatorId,
                        RequiresSubmit = currentToken.Indicator == null ? false : currentToken.Indicator.RequiresSubmit
                    });
                }
                else
                {
                    throw new ArgumentException("Invalid formula: invalid token type");
                }
            }

            // for all remaining operators, move to output
            while (operators.Count > 0)
            {
                output.Push(operators.Pop());
            }

            // reverse the stack
            var reversedStack = new Stack<TokenStruct>();
            while (output.Count > 0)
            {
                var token = output.Pop();
                if (token.TokenType == TokenType.Parenthesis) throw new ArgumentException("Invalid formula: missing parenthesis");
                reversedStack.Push(token);
            }

            // return the reversed postfix stack
            var arr = new TokenStruct[reversedStack.Count];
            reversedStack.CopyTo(arr, 0);
            Array.Reverse(arr);
            return new Stack<TokenStruct>(arr);
        }

        internal static OperatorType GetOperator(string op)
        {
            if (op == "+") return OperatorType.Add;
            if (op == "-") return OperatorType.Subtract;
            if (op == "/") return OperatorType.Divide;
            if (op == "*") return OperatorType.Multiply;
            throw new NotImplementedException("Invalid Operator in Utilities.Calculation.GetOperator");
        }

        internal static ParenthesisType GetParenthesis(string paren)
        {
            if (paren == "(") return ParenthesisType.Open;
            if (paren == ")") return ParenthesisType.Close;
            throw new NotImplementedException("Invalid Parenthesis in Utilities.Calculation.GetParenthesis");
        }

        internal struct TokenStruct
        {
            public TokenType TokenType { get; set; }
            public ParenthesisType? ParenthesisType { get; set; }
            public int Precedence { get; set; }
            public decimal? Number { get; set; }
            public OperatorType? OperatorType { get; set; }
            public bool? ConvertNullToZero { get; set; }
            public Guid? IndicatorId { get; set; }
            public bool RequiresSubmit { get; set; }
        }

        public enum EntityLinkChangeType { Add, Remove }
    }
}