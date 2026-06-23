using System.Transactions;

namespace Monic.Web.Code
{
    public class Db
    {
        public static TransactionScope CreateTransactionScope()
        {
            var transactionOptions = new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted,
                Timeout = TransactionManager.MaximumTimeout
            };

            return new TransactionScope(TransactionScopeOption.Required, transactionOptions, TransactionScopeAsyncFlowOption.Enabled);
        }
    }
}
