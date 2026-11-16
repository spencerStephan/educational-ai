# {{Feature Name}} Feature Requirements Document

## Metadata

| Feature ID     | {{id}} |
| -------------- | ------ |
| Assignee Email |        |

| Size                  | Estimate | Actual |
| :-------------------- | :------- | :----- |
| {{XS / S / M / L / XL}} |          |        |

| Linked Issue         | Relationship       |
| :------------------- | :----------------- |
| {{ID of Linked Issue}} | {{Parent / Sibling}} |

## Feature Description

{{Give a brief description of the feature, including what it does, why it's needed, and how it fits into the overall product.}}

## Problem Statement

{{Describe the problem that the feature is solving. This should include the pain points, the current solutions, and the desired outcome.}}

## User Stories

{{As a {{persona}}, I want to {{goal}} so that {{reason}}.}}

{{Example: As a user, I want to be able to enroll in a course so that I can learn new skills.}}

## Acceptance Criteria

The feature should meet the following criteria:

- {{Criteria 1}}
- {{Criteria 2}}
- {{Criteria 3}}

Example: The feature should meet the following criteria:

- The feature should be able to add a course to the user's cart if it is a paid course
- The feature should be able to remove a course from the user's cart if it is a paid course

## Functional Requirements

- {{Functional requirement 1}}
- {{Functional requirement 2}}

Example:

- The feature should be able to add/remove a course to/from the user's cart if it is a paid course
- That course becomes accessible to the user immediately after enrollment

## Non-Functional Requirements

- {{Non-functional requirement 1}}
- {{Non-functional requirement 2}}

Example:

- The user's cart should be saved to cookies when the user is not logged in

## Constraints

{{List of assumptions}}

Example:

- The feature is only available to users who have a valid email address
- Users have enabled cookies in their browser
- This feature must work with JavaScript disabled

## Risks

### Project Management Risks

<table>
  <tr>
    <th>Risk</th>
    <th>Likelihood</th>
    <th>Mitigation</th>
  </tr>
  <tr>
    <td>{{Scope Creep}}</td>
    <td>{{High / Medium / Low}}</td>
    <td>{{Do not add additional items to the feature without approval}}</td>
  </tr>
</table>

### Operational Risks

<table>
  <tr>
    <th>Risk</th>
    <th>Likelihood</th>
    <th>Mitigation</th>
  </tr>
  <tr>
    <td>{{Users may want to enrol in a paid course but do not have a valid payment method}}</td>
    <td>{{High / Medium / Low}}</td>
    <td>{{Support shows them how to create a course for free}}</td>
  </tr>
</table>

### Technical Risks

<table>
  <tr>
    <th>Risk</th>
    <th>Likelihood</th>
    <th>Mitigation</th>
  </tr>
  <tr>
    <td>{{Payments can die in-transit}}</td>
    <td>{{High / Medium / Low}}</td>
    <td>{{Ensure payments are idempotent and can be retried/recover without double charging}}</td>
  </tr>
</table>

### External Risks

<table>
  <tr>
    <th>Risk</th>
    <th>Likelihood</th>
    <th>Mitigation</th>
  </tr>
  <tr>
    <td>{{Payment gateway brings in a 3rd party tool to handle payments}}</td>
    <td>{{High / Medium / Low}}</td>
    <td>{{Ensure the payment gateway is well documented and compatible with our platform}}</td>
  </tr>
</table>

### Financial Risks

<table>
  <tr>
    <th>Risk</th>
    <th>Likelihood</th>
    <th>Mitigation</th>
  </tr>
  <tr>
    <td>{{Credit card fees can be more expensive than the revenue generated from the course}}</td>
    <td>{{High / Medium / Low}}</td>
    <td>{{Ensure the pricing is competitive and the course is valuable enough to justify the cost}}</td>
  </tr>
</table>

### Success Metrics

<table>
  <tr>
    <th>Metric</th>
    <th>Target</th>
    <th>Measurement</th>
  </tr>
  <tr>
    <td>{{Number of courses enrolled}}</td>
    <td>{{100}}</td>
    <td>{{Number of courses enrolled / total number of courses}}</td>
  </tr>
</table>

## Open Ended Questions

- {{Open ended question 1}}
- {{Open ended question 2}}

Example:

- What are the credit card fees for the payment gateway?
- What is the service charge we are adding to the course price?
