# cfpack

[![Version](https://img.shields.io/npm/v/cfpack.js.svg)](https://www.npmjs.com/package/cfpack.js)
[![Downloads/week](https://img.shields.io/npm/dw/cfpack.js.svg)](https://www.npmjs.com/package/cfpack.js)
[![License](https://img.shields.io/npm/l/cfpack.js.svg)](https://github.com/eugene-manuilov/cfpack/blob/master/package.json)

A small CLI tool that can help you to deal with huge CloudFormation templates by splitting it into multiple smaller templates. Using this tool you can also build sharable drop-in templates that you can share across your projects.

[![cfpack](https://asciinema.org/a/TXlSiEeZvDNBUl2lOahyHmith.svg)](https://asciinema.org/a/TXlSiEeZvDNBUl2lOahyHmith)

## Table of Contents

- [Installation](#installation)
  - [Enable bash/zsh-completion shortcuts](#enable-bashzsh-completion-shortcuts)
- [Getting Started](#getting-started)
- [Build Templates](#build-templates)
- [Commands](#commands)
  - [Init](#init)
  - [Build](#build)
  - [Deploy](#deploy)
  - [Artifacts](#artifacts)
  - [Delete](#delete)
- [Config file](#config-file)
  - [Parameters](#parameters)
  - [Artifacts](#artifacts-1)
  - [IAM roles](#iam-roles)
- [Contribute](#contribute)
- [LICENSE](#license)

## Installation

Install the package as global dependency to be able to use with different projects:

```
npm i -g cfpack.js
```

You can also install it as a project dependency and add NPM scripts if you need it for a specific project or you want to run it during CI/CD process. Just run the following command:

```
npm i cfpack.js --save-dev
```

Then you can create shortcuts in your `package.json` file:

```
{
	"name": "my-project",
	...
	"scripts": {
		"stack:build": "cfpack build",
		"stack:deploy": "cfpack deploy",
		"stack:delete": "cfpack delete"
	},
	...
}
```

### Enable bash/zsh-completion shortcuts

If you want to enable bash/zsh-completion shortcuts in your terminal, then you need to run `cfpack completion` command and add generated script to your `.bashrc` or `.bash_profile` (or `.zshrc` for zsh). You can do it by running the following command:

```
cfpack completion >> ~/.bashrc
```

Once completion script is added, you need to logout and then login back to make sure that terminal reads the script and start using completion for cfpack commands.

## Getting Started

Before you start using this tool, you need to create a configuration file in the root of your project. Just run `cfpack init` command and it will create `cfpack.config.js` file with default settings. The file is pretty obvisous and specifies a folder with template files, a path to resulting template, CloudFormation stack information and the like. Just amend values if you need to change something and it will use what you want.

You may also need to make sure that you have AWS credentials on your machine. The easiest way to do it is to install AWS CLI tool on your machine and run `aws configure` command to enter access key id and secret access key. It will be used by AWS Node.js SDK to work with CloudFormation stacks when you deploy it or want to delete it.

## Build Templates

Once everything is ready, you can split your original CloudFormation template into multiple smaller templates and put it into the entry folder. For example, if you have a template that declares CodeBuild, CodePipeline, S3 Bucket, AWS Lambda, DynamoDb tables and appropriate IAM resources, then you can create the following templates in the entry folder and split resoruces between them:

- `build.yaml` - will contain CodeBuild and CodePipeline resources
- `compute.yaml` - will contain AWS Lambda resources
- `database.yaml` - will contain DynamoDb tables
- `storage.yaml` - will contain S3 buckets
- `roles.yaml` - will contain IAM roles and policies

If you have parameters, outputs, metadata, mappings and/or conditions in your original template, then it also can be split between different templates. Just use your judment to deside what should be where.

Just keep in mind that whenever you create a "sub-template", it has to adhere the standard formating and be valid from CloudFormation point of view.

## Commands

The package provides four commands: `init`, `build`, `deploy` and `delete`. These commands are pretty much self explanatory, but let's take a look at each of them.

#### Init

The `init` command is intended to initialize configuration file in the current working directory. Just run `cfpack init` and a new `cfpack.config.js` file will be create in the folder. Please, pay attention that it will override existing one if you have already created it.

#### Build

The `build` command will loop through the entry folder, find all files in it, read temlates and compose the final template which will be saved at a location specified in the config file. The command understands both json and yaml templates, and uses JSON format for the final template.

#### Deploy

The `deploy` command executes build task first to create resulting template and then use it to create or update CloudFormation stack using AWS Node.js SDK. The command checks whether or not a stack exists to determine which action is required to create or update the stack. This command will also upload artifacts if you define it in the `cfpack.config.js` file to make sure that CloudFormation stack can properly provision resoureces like lambda functions or appsync graphql API or resolvers.

#### Artifacts

The `artifacts` command allows you to upload artifacts that are defined in the config file. You can define as many artifacts as you need.

#### Delete

Finally, the `delete` command just checks if the stack exists and then calls API to delete it.

## Config file

### Parameters

As it has been said above, the config file is pretty obvious and self explanatory. It allows you to define your stack information and provide additional details like parameters or capabilities. Thus if your template uses input parameters, you can define them in the config file in the `stack` > `params` section as shown below:

```
module.exports = {
    ...
    stack: {
        name: "my-stack",
        region: "us-east-1",
        params: {
            ...
            Parameters: [
                {
                    ParameterKey: 'key1',
                    ParameterValue: 'valueA'
                },
                {
                    ParameterKey: 'key2',
                    ParameterValue: 'valueB'
                }
            ]
        }
    }
};
```

If your parameters contain sensetive data and you can't commit it into your repository, then you can consider using environment vairables and [dotenv](https://www.npmjs.com/package/dotenv) package to load it. Install it, create `.env` file and define values that you want to use. Then update your `cfpack.config.js` file.

```
# .env file
KEY1_VALUE=valueA
KEY2_VALUE=valueB
```

```
// cfpack.conifg.js

require('dotenv').config();

module.exports = {
    ...
    stack: {
        name: "my-stack",
        region: "us-east-1",
        params: {
            ...
            Parameters: [
                {
                    ParameterKey: 'key1',
                    ParameterValue: process.env.KEY1_VALUE
                },
                {
                    ParameterKey: 'key2',
                    ParameterValue: process.env.KEY2_VALUE
                }
            ]
        }
    }
};
```

### Artifacts

If your templates have resources (like lambda functions, appsync graphql schema or resolvers, etc) that rely on artifacts located in a s3 bucket, then you can define which files need to be uploaded during deployment process.

Let's consider that you have a template like this:

```
Resources:
  Schema:
    Type: AWS::AppSync::GraphQLSchema
    Properties:
      ApiId: ...
      DefinitionS3Location: s3://my-bucket/graphql/schema.graphql
  ResolverA:
    Type: AWS::AppSync::Resolver
    Properties:
      ApiId: ...
      DataSourceName: ...
      TypeName: typeA
      FieldName: field1
      RequestMappingTemplateS3Location: s3://my-bucket/graphql/resolvers/typeA/field1/request.txt
      ResponseMappingTemplateS3Location: s3://my-bucket/graphql/resolvers/typeA/field1/response.txt
  ResolverB:
    Type: AWS::AppSync::Resolver
    Properties:
      ApiId: ...
      DataSourceName: ...
      TypeName: typeB
      FieldName: field2
      RequestMappingTemplateS3Location: s3://my-bucket/graphql/resolvers/typeB/field2/request.txt
      ResponseMappingTemplateS3Location: s3://my-bucket/graphql/resolvers/typeB/field2/response.txt
  LambdaFunctionA:
    Type: AWS::Lambda::Function
    Properties: 
      Handler: index.handler
      Role: ...
      Code: 
        S3Bucket: my-bucket
        S3Key: lambdas/function-a.zip
      Runtime: nodejs8.10
      ...
  LambdaFunctionB:
    Type: AWS::Lambda::Function
    Properties: 
      Handler: index.handler
      Role: ...
      Code: 
        S3Bucket: my-bucket
        S3Key: lambdas/function-b.zip
      Runtime: nodejs8.10
      ...
```

And the structure of your project looks like this:

```
/path/to/your/project
  ├─ package.json
  ├─ package-lock.json
  ├─ cfpack.config.json
  ├─ graphql
  │   ├─ schema.graphql
  │   └─ resolvers
  │       ├─ typeA
  │       │   ├─ field1
  │       │   │   ├─ request.txt
  │       │   │   └─ response.txt
  │       │   └─ ...
  │       ├─ typeB
  │       │   ├─ field2
  │       │   │   ├─ request.txt
  │       │   │   └─ response.txt
  │       │   └─ ...
  │       └─ ...
  ├─ lambdas
  │   ├─ functionA
  │   │   ├─ src
  │   │   ├─ node_modules
  │   │   ├─ package.json
  │   │   └─ package-lock.json
  │   └─ functionB
  │       ├─ src
  │       ├─ node_modules
  │       ├─ package.json
  │       └─ package-lock.json
  └─ ...
```

Then you can update the configuration file to upoad all artifacts like this:

```
module.exports = {
    ...
    stack: {
        name: "my-stack",
        region: "us-east-1",
        params: {
            ...
        },
        artifacts: [
            {
                bucket: "my-bucket",
                files: {
                    "graphql/": {
                        baseDir: "graphql",
                        path: "**/*"
                    },
                    "lambdas/function-a.zip": {
                        baseDir: "lambdas/functionA",
                        path: "**/*",
                        compression: "zip"
                    },
                    "lambdas/function-b.zip": {
                        baseDir: "lambdas/functionB",
                        path: "**/*",
                        compression: "zip"
                    }
                }
            }
        ]
    }
};
```

Please, pay attention that the bucket must already exist to successfully upload artifacts. It means that you can't define a bucket that you are going to use to store artifacts in your CloudFormation template because artifacts need to be uploaded before your stack is created.

### IAM roles

Please, pay attention that if your CloudFormation template contains IAM roles or policies you must explicity acknowledge that it contains certain capabilities in order for AWS CloudFormation to create or update the stack. To do it, just add `Capabilities` to your config file as shown below:

```
module.exports = {
    ...
    stack: {
        name: "my-stack",
        region: "us-east-1",
        params: {
            ...
            Capabilities: ['CAPABILITY_IAM'],
            ...
        }
    }
};
```

## Contribute

Want to help or have a suggestion? Open a [new ticket](https://github.com/eugene-manuilov/cfpack/issues/new) and we can discuss it or submit a pull request.

## LICENSE

The MIT License (MIT)
