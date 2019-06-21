def bucket = 'myjenkinsbucket'
def functionName = 'greetings'
def region = 'us-east-1'
def lambdaVersion = ''

def commitID() {
        sh 'git rev-parse HEAD > .git/commitID'
        def commitID = readFile('.git/commitID').trim()
        sh 'rm .git/commitID'
        commitID
}

pipeline {
    agent any
    environment {
        // Make use of this environment variable to build deployment logic
        ENV_NAME = "${env.BRANCH_NAME}"
    }
    tools {
        nodejs 'localnode'
    }
      stages {
          stage('Build'){
              steps {
                    echo 'Building Branch: ' + env.BRANCH_NAME
                    echo 'Build Number: ' + env.BUILD_NUMBER
                    echo 'Building Environment: ' + ENV_NAME
                    echo "Building the project"
                    sh 'npm install'
                    sh "zip ${commitID()}.zip * -x Jenkinsfile README.md"
                }
            }

        stage('Push'){
            steps{
                echo "Pushing the code to s3 bucket ${bucket}"
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-s3-bucket']]) {
                    sh "aws s3 cp ${commitID()}.zip s3://${bucket}"
                }
            }
        }

        stage('Deploy'){
            steps {
                echo "Code deployment of lambda function ${functionName}"
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-s3-bucket']]) {
                sh "aws lambda update-function-code --function-name ${functionName} \
                    --s3-bucket ${bucket} \
                    --s3-key ${commitID()}.zip \
                    --region ${region}"
                    // -- publish true" --> use this to publish new version
                }
            }
        }

        stage('Publish') {
            steps {
                echo "Publishing function version and updating alias"
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-s3-bucket']]) {
                    lambdaVersion = sh(
                        script: "aws lambda publish-version --function-name ${functionName} --region ${region} | jq -r '.Version'", returnStdout: true
                    )
                    sh "aws lambda update-alias --function-name ${functionName} --name dev --region ${region} --function-version ${lambdaVersion}"
                }
              }
            }
        }

        /* if (env.BRANCH_NAME == 'master') {
           Write a logic based on branch name, for e.g. Master 
         }
         */
      }
}