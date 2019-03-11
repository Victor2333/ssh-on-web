pipeline {
    agent any
    environment {
        DOCKERCRE = credentials('docekrHubCredential')
        KUBECONFIG = credentials('kubectl-config-file')
    }
    stages {
        stage('Docker Login') {
            steps {
                sh 'docker login -u $DOCKERCRE_USR -p $DOCKERCRE_PSW'
            }
        }

        stage('Build ssh-on-web') {
            steps {
                sh './JenkinsStage/Stage-1.sh $DOCKERCRE_USR/ssh-on-web 1.0.$BUILD_ID'
            }
        }

        stage('Build mongodb') {
            steps {
                sh './JenkinsStage/Stage-2.sh $DOCKERCRE_USR/ssh-on-web-mongodb 1.0.$BUILD_ID'
            }
        }

        stage('INSTALL') {
            steps {
                sh './JenkinsStage/Stage-3.sh'
            }
        }

        stage('Deploy') {
            steps {
                sh './envsubst < ./k8s-deploy/mongo-deploy.yaml | ./kubectl --kubeconfig $KUBECONFIG apply -f -'
                sh './envsubst < ./k8s-deploy/ssh-on-web-deploy.yaml | ./kubectl --kubeconfig $KUBECONFIG apply -f -'
            }
        }
    }
}