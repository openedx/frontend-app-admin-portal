============================================
12. Credit Card Only for Payment Methods
============================================

******
Status
******

Accepted (March 2026)

*******
Context
*******

During development of the native billing management feature, ACH (US bank account) payment support was 
initially *intended* to be implemented to provide customers with multiple payment options. 
However, a security review identified critical compliance and security vulnerabilities in the ACH implementation:

**Security & Compliance Risks Identified:**

1. **PCI DSS Violation**: The implementation collected raw bank account credentials (routing number, account number) directly in the frontend JavaScript, exposing sensitive financial data in browser memory, network requests, and potential XSS vulnerabilities.

2. **NACHA Non-Compliance**: No verification mechanism was implemented for bank account ownership. NACHA rules require verification (via micro-deposits or instant verification) before authorizing ACH debits. The implementation allowed any user to add any bank account without verification, creating significant fraud risk.

3. **Stripe Best Practices Violation**: The proposed implementation used Stripe's legacy ``createPaymentMethod`` API with raw ``us_bank_account`` credentials. Stripe explicitly recommends against this approach in production, instead recommending:

   - Stripe Financial Connections (OAuth-based bank login with instant verification)
   - Payment Element with built-in verification
   - Micro-deposit verification at minimum

4. **Legal & Financial Exposure**: The non-compliant implementation created risk for:

   - Regulatory fines
   - Customer disputes and chargebacks
   - Fraudulent transactions
   - Reputational damage

**Effort Analysis:**

Implementing ACH correctly would require:

- **Short-term** Micro-deposit verification flow with backend support
- **Long-term** Stripe Financial Connections integration with OAuth flow
- Ongoing maintenance and security updates
- Additional QA and security review cycles

********
Decision
********

**We will support credit/debit cards ONLY for payment methods.**

Credit card payments through Stripe's CardElement provide:

- **PCI Compliance**: Stripe.js tokenizes card data, never exposing raw credentials
- **Industry Standard**: Universal acceptance for B2B SaaS payments
- **Proven Security**: Battle-tested implementation used across the edX platform
- **Lower Fraud Risk**: Card networks provide built-in fraud detection
- **Immediate Processing**: No verification delays like ACH micro-deposits

************
Consequences
************

**Positive:**

- Zero compliance risk - fully PCI compliant out of the box
- Simplified codebase - removed ~400 lines of vulnerable code
- Faster development - no need to build verification flows
- Reduced maintenance burden - one payment method to support
- Lower fraud risk - proven credit card security

**Negative:**

- Some customers may prefer ACH for lower processing fees
- ACH is common for larger B2B transactions
- Customers without credit cards cannot pay (rare for B2B customers)

**Future Considerations:**

If ACH support is required in the future, it MUST include:

1. Stripe Financial Connections for secure OAuth-based verification (preferred)
2. OR proper micro-deposit verification flow with backend support (minimum viable)
3. Security review and penetration testing
4. NACHA compliance audit
5. Legal review of authorization language

The cost of implementing ACH correctly should be weighed against the risk of a single fraud incident or compliance violation.

**********
References
**********

* Stripe Financial Connections: https://stripe.com/docs/payments/connected-accounts
* PCI DSS Requirements: https://www.pcisecuritystandards.org/
* NACHA Operating Rules: https://www.nacha.org/rules
* Stripe Best Practices for ACH: https://stripe.com/docs/payments/ach-debit
* Related Code PR: [link to PR]
