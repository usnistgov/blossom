# Automated Blossom Dashboard Deployment

**NOTE**: This is a work in progress.

Install these things in order to follow the instructions to set up the Blossom Dashboard.
The dashboard will be deployed via AWS services.

## Step 0: Prerequisites

These prerequisites must be installed on the machine where the Blossom Dashboard will be deployed from.

* git
* [Terraform](https://developer.hashicorp.com/terraform/install)
* [jq](https://jqlang.github.io/jq/)
* [nvm](https://github.com/nvm-sh/nvm) (Node version manager)
  * Optional (recommended) [nvm auto-use setup for your shell](https://github.com/nvm-sh/nvm?tab=readme-ov-file#deeper-shell-integration)
* [Node JS](https://nodejs.org/en/download) (v22)

* Create an S3 bucket which will store the Terraform state.
  This bucket should be named `<your-organization>-blossom-iac` which is defined in the `<git-repo>/iac/provider.tf` file as the backend.

## Step 1: Clone Repositories

**NOTE**: This section is a work in progress.

Fork the blossom-member git repository:

* URL: <https://github.com/usnistgov/blossom-member>

Clone your forked repository

```zsh
git clone <your forked git repo url>
cd <your git repo name>
```

Pull down the git submodules

```zsh
git submodule update --init --recursive
```

## Step 2: Set up Terraform Workspace

Set up a [Terraform workspace](https://developer.hashicorp.com/terraform/cloud-docs/workspaces)

```zsh
cd iac/
# initialize terraform
terraform init
# Create workspace
terraform workspace new BLOSSOM_<your-org>
# List workspaces
terraform workspace show
```

## Step 3: Set Configuration

Create a new `<git repo>/iac/configurations/BLOSSOM_<your-org>.json` file in the git repository with the following contents.

```json
{
  "network_id": "n-XXXXXXXXXXXXXXXXXXXXXXXXXX",
  "network_name": "blossom",
  "member_id": "m-YYYYYYYYYYYYYYYYYYYYYYYYYY",
  "member_name": "your-amb-member-name",
  "peer_node_id": "nd-AAAAAAAAAAAAAAAAAAAAAAAAAA",
  "channel_name": "authorization",
  "contract_name": "authorization",
  "all_channels": "authorization, business",
  "all_contracts": "authorization, business",
  "identities_ssm_prefix": "/<organization>/blossom/dev/user",
  "cognito_user_pool_name": "<organization>_blossom",
  "apigw_s3_integration_iam_role_name": "frontend-apigw-s3-integration-role",
  "lambda_execution_iam_role_name": "LambdaExecutionRole"
}
```

Of note:

* the `BLOSSOM_<your-org>` filename must be the same exact name as the terraform workspace.
* Most of the information here comes from the "Set up Amazon Managed Blockchain" section above. (TODO: This is from a different technical guide that needs to be uploaded)
* `channel_name` is the chaincode channel name where the blossom chaincode lives
* `contract_name` is the name of the chaincode on the channel
* `identities_ssm_prefix` is the prefix used in the AWS ParameterStore
* the IAM role names need to be defined as described in the [README](https://github.com/usnistgov/blossom-member/blob/main/iac/README.md) in the `iac/` directory

The `iac/lambda.tf` file currently needs to be updated to include subnet IDs for the VPC that the lambda function uses.
This is in the section below:

```hcl
resource "aws_lambda_function" "query" {
  vpc_config {
    subnet_ids = [
      "subnet-01234567890abcdef",
      "subnet-12121212121212121",
    ]
    security_group_ids = [
      "sg-01234567890abcdef",
      "sg-12121212121212121",
    ]
  }
}
```

Run the following commands to verify that the configuration is working properly

```zsh
cd iac/
make build
make plan
```

## Step 4: Create Infrastructure

This command creates the infrastructure, but the `base_url` variable for the homepage isn't set properly the first time, so it MAY need to be run twice.

```zsh
# Creates resources, but doesn't set the base_url the very first time
make apply
# Run a second time!
make apply
```

## (Optional) Step 5: Manual AWS Edits

### S3 Bucket visibility

There are two S3 buckets that are created in step 3.
One contains the assets for the web dashboard, and the other holds the Lambda code in a zip file.
Check both to make sure that they are set to either public or private as needed.

### Set up AWS Cognito

This is done through `make apply` now!
But we need to verify that the credentials still work.

Open the AWS Console. Then go to

**NOTE**: This was correct until AWS changed the UI for Cognito.

Cognito > User pools > [your Cognito User Pool name] > App Integration > App clients and analytics > [client name] > Hosted UI > Edit

* Add the above `gw_url` / `base_url` to both the "Allowed callback URLs" and "Allowed sign-out URLs" lists. Both with and without a trailing slash, e.g.

  * <https://1234567890.execute-api.us-east-1.amazonaws.com/dev>
  * <https://1234567890.execute-api.us-east-1.amazonaws.com/dev/>

* Save changes

### Set up ParameterStore

Next, in the AWS Console go to Systems Manager > Parameter Store

Create the following keys, each as SecureStrings.

`username` is the AWS Cognito username

`organization` is your organization name

* `/<organization>/blossom/dev/user/<username>/cert`
  * comes from: `admin-msp/admincerts/cert.pem`
* `/<organization>/blossom/dev/user/<username>/mspId`
  * is the member ID for your member
* `/<organization>/blossom/dev/user/<username>/pk`
  * comes from: `admin-msp/keystore/`
