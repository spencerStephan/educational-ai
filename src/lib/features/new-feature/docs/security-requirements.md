# New Feature Security Requirements Document

## Metadata

| Feature ID     | 49f021ca-a367-4c76-a378-635a2aaba342 |
| -------------- | ------ |
| Assignee Email |     |

## Threats

[What threats are there for this this feature?]

Example:

- A bad actor could try to input stolen credit card information to make a payment.

## Surface Area

[What surfaces are affected by this feature?]

Example:

- The payment form
- The payment confirmation page
- The payment history page
- The payment refund page
- The payment capture page
- The payment refund page

## Security Controls

### Authentication

[How is authentication handled for this feature?]

Example:

- Authentication is handled by JWT tokens.

### Authorization

[How is authorization handled for this feature?]

Example:

- Only authenticated users can make payments.

### Rate Limiting

[How is rate limiting handled for this feature?]

Example:

- Rate limiting is handled by IP address.
- No more than 10 payments per minute per IP address.

## Error Handling

[How is error handling handled for this feature?]

Example:

- All convex functions should properly handle errors and return the proper status code
- Errors are caught using a `try`/`catch` block on the client

## Data Protection

[How is data protected for this feature?]

Example:

- Data is protected by encryption at rest and in transit.
  - AWS KMS for encryption at rest.
  - AWS CloudFront for encryption in transit.
  - Stripe provides the modal for the payment form.

## Privacy

[How is privacy handled for this feature?]

Example:

- Sensitive data is stored in the database in an encrypted format.
- Stripe handles the storage of sensitive payment data.

## Additional Security Features

- Geofencing is used to limit purchases to non-Russian & Chinese IP addresses.

## Logging

[How is logging handled for this feature?]

Example:

- All errors are logged via Sentry.

## Monitoring

[How is monitoring handled for this feature?]

Example:

- Services are monitored via AWS CloudWatch and sent in real-time to a Slack channel.
- Errors are monitored via Sentry.
- Grafana / Prometheus is used to monitor the health of the services.

## Supply Chain Security

- All dependencies should be scanned for vulnerabilities using Dependabot.

## Compliance & Regulatory

[Are there any compliance or regulatory requirements for this feature?]

Example:

- GDPR compliance is required.
- PCI DSS compliance is required.

## Approval

- All changes to this feature should be approved by the security & compliance team.

## Open Ended Questions

[Open ended question 1]

Example:

- What is the impact of a DDoS attack on this feature?
- What is the impact of a data breach on this feature?
