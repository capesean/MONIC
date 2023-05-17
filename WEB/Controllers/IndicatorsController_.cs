using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WEB.Models;

namespace WEB.Controllers
{
    public partial class IndicatorsController
    {
        [HttpPost("{indicatorId:Guid}/formula")]
        public async Task<IActionResult> SaveFormula([FromRoute] Guid indicatorId, [FromBody] TokenDTO[] tokenDTOs)
        {
            var indicator = await db.Indicators
                .Include(o => o.Tokens).ThenInclude(o => o.SourceIndicator)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);

            if (indicator == null) return NotFound();

            if (indicator.IndicatorType == IndicatorType.Calculated && tokenDTOs.Length == 0) return BadRequest("Invalid formula: blank");

            var newTokens = new List<Token>();
            var tokenNumber = (short)0;
            foreach (var tokenDTO in tokenDTOs)
            {
                if (tokenDTO.IndicatorId != indicatorId) return BadRequest("IndicatorId mismatch");
                if (tokenDTO.SourceIndicatorId == indicator.IndicatorId) return BadRequest("The formula includes the same indicator (circular reference)");

                var token = new Token();
                ModelFactory.Hydrate(token, tokenDTO);

                // set indicatorid & reset numbering
                token.IndicatorId = indicatorId;
                token.TokenNumber = tokenNumber;

                // validate & clean
                var error = token.Validate();
                if (error != null) return BadRequest(error);

                if (token.TokenType == TokenType.Indicator)
                {
                    var check = await db.Indicators.FirstAsync(o => o.IndicatorId == token.IndicatorId);
                    if (indicator.ReportingFrequency < check.ReportingFrequency)
                        throw new Exception($"Indicator {indicator.Code} frequency is incompatible with indicator {check.Code} frequency");
                }

                newTokens.Add(token);
                tokenNumber++;
            }

            try
            {
                foreach (var token in newTokens.Where(o => o.TokenType == TokenType.Indicator))
                    token.Indicator = await db.Indicators.FirstOrDefaultAsync(o => o.IndicatorId == token.IndicatorId);
                indicator.Tokens = newTokens;

                //new Calculation(db, Settings, CurrentUser.Id).TestFormula(indicator);
            }
            catch (ArgumentException err)
            {
                return BadRequest(err.Message);
            }

            var oldTokens = await db.Tokens.Where(o => o.IndicatorId == indicatorId).ToListAsync();
            foreach (var token in oldTokens)
            {
                db.Entry(token).State = EntityState.Deleted;
            }
            await db.SaveChangesAsync();

            foreach (var token in newTokens)
            {
                db.Entry(token).State = EntityState.Added;
            }
            await db.SaveChangesAsync();

            return Ok((await db.Tokens.Include(t => t.SourceIndicator.EntityType).Where(t => t.IndicatorId == indicatorId).ToListAsync()).Select(t => ModelFactory.Create(t)));
        }

        [HttpPost("{indicatorId:Guid}/calculate")]
        public async Task<IActionResult> Calculate([FromRoute] Guid indicatorId)
        {
            var indicator = await db.Indicators
                .Include(o => o.Tokens)
                .ThenInclude(o => o.SourceIndicator)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);

            if (indicator == null) return NotFound();
            if (indicator.Tokens.Count == 0) return BadRequest("The indicator does not have a formula");

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);

            await calculation.CalculateAsync(indicator);

            return Ok();
        }

    }
}
