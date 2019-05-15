const cdk = require("@aws-cdk/cdk");
const codebuild = require("@aws-cdk/aws-codebuild");
const iam = require("@aws-cdk/aws-iam");
const fs = require('fs-extra');
var argv = {};

function createStatement() {
  const statement = new iam.PolicyStatement(iam.PolicyStatementEffect.Allow);
  statement
    .addAction('ecr:*')
    .addAllResources();
  return statement;
}

//stack
class CodeBuildStack extends cdk.Stack {
  constructor(parent, id, props) {
    super(parent, id, props);

    //create aws code build with webhook name
    const gitHubSource = new codebuild.GitHubSource({
      owner: props.gitOwner,
      repo: props.gitRepo,
      webhook: true,
    });
    const codebuildProject = new codebuild.Project(this, props.gitRepo + '_build', {
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_DOCKER_18_09_0,
        privileged: true,
        environmentVariables: {
          "AWS_ACCOUNT_ID": {
            value: props.env.account.toString(),
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT
          }
        }
      }
    });
    codebuildProject.role.addToPolicy(createStatement());
  }
}

//app
class codeApp extends cdk.App {
  constructor(argv) {
    super(argv);

    // stack for codebuild
    this.codeBuildStack = new CodeBuildStack(this, 'codebuild-' + argv.gitRepo, argv);
  };
}

if (fs.pathExistsSync('/tmp/argv.json')) {
  argv = require('/tmp/argv.json');
}

new codeApp(argv).run();