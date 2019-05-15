const iam = require("@aws-cdk/aws-iam");

function createAssumeRolePolicy(principal, externalId) {
  const statement = new iam.PolicyStatement();
  statement
    .addPrincipal(principal)
    .addAction(principal.assumeRoleAction);

  if (externalId !== undefined) {
    statement.addCondition('StringEquals', { 'sts:ExternalId': externalId });
  }

  return new iam.PolicyDocument().addStatement(statement);
}

function createStatement() {
  const statement = new iam.PolicyStatement(iam.PolicyStatementEffect.Allow);
  statement
    .addAction('ecr:*')
    .addAllResources();
  return statement;
}

function createInlinePolices() {
  const statement1 = new iam.PolicyStatement(iam.PolicyStatementEffect.Allow);
  statement1
    .addActions(['logs:CreateLogStream', 'logs:PutLogEvents', 'logs:CreateLogGroup'])
    .addAllResources();
  const statement2 = new iam.PolicyStatement(iam.PolicyStatementEffect.Allow);
  statement2
    .addAction('ecr:*')
    .addAllResources();
  const policyDocument = new iam.PolicyDocument();
  policyDocument.addStatement(statement1);
  policyDocument.addStatement(statement2);
  return policyDocument;
}

function createRole() {
  const inlinePolicies = createInlinePolices();
  //create iam role
  const buildRole = new iam.Role(this, 'role', {
    assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    inlinePolicies: {
      'defaultPolicy': inlinePolicies
    }
  });
  return buildRole;
}