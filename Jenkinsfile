node {
    checkout scm

    docker.withRegistry('victor2333', 'docekrHubCredential') {

        def mongodbImage = docker.build("ssh-on-web-mongodb:1.0.${env.BUILD_ID}","./mongodb")
        def sshImage = docker.build("ssh-on-web:1.0.${env.BUILD_ID}")

        mongodbImage.push()
        sshImage.push()
    }
}