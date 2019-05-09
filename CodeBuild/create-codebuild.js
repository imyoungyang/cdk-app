const cdk = require("@aws-cdk/cdk");
const codebuild = require("@aws-cdk/aws-codebuild");
const fs = require('fs-extra');
var argv = {};

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
        new codebuild.Project(this, props.gitRepo, {
            source: gitHubSource,
            environment: {
                buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_DOCKER_18_09_0,
                privileged: true
            }
        });
    }
}

//app
class codeApp extends cdk.App {
    constructor(argv) {
        super(argv);
    
        // stack for codebuild
        this.codeBuildStack = new CodeBuildStack(this, argv.gitRepo, argv);
    };
}

if (fs.pathExistsSync('/tmp/argv.json')) {
    argv = require('/tmp/argv.json');
} 

new codeApp(argv).run();