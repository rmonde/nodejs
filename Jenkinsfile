
def bucket = 'myjenkinsbucket'
def functionName = 'greetings'
def region = 'us-east-1'

agent any

    // stage('Test'){
    //     sh 'go get -u github.com/golang/lint/golint'
    //     sh 'go get -t ./...'
    //     sh 'golint -set_exit_status'
    //     sh 'go vet .'
    //     sh 'go test .'
    // }

    stage('Build'){
        echo "Building the project"
        sh 'npm install'
        sh "zip ${commitID()}.zip main"
    }

    stage('Push'){
        echo "Pushing the code to s3 bucket"
        sh "aws s3 cp ${commitID()}.zip s3://${bucket}"
    }

    stage('Deploy'){
        echo "Deploying the code to lambda function"
        sh "aws lambda update-function-code --function-name ${functionName} \
                --s3-bucket ${bucket} \
                --s3-key ${commitID()}.zip \
                --region ${region}"
    }

    if (env.BRANCH_NAME == 'master') {
        stage('Publish') {
            def lambdaVersion = sh(
                script: "aws lambda publish-version --function-name ${functionName} --region ${region} | jq -r '.Version'",
                returnStdout: true
            )
            sh "aws lambda update-alias --function-name ${functionName} --name dev --region ${region} --function-version ${lambdaVersion}"
        }
    }

def commitID() {
    sh 'git rev-parse HEAD > .git/commitID'
    def commitID = readFile('.git/commitID').trim()
    sh 'rm .git/commitID'
    commitID
}