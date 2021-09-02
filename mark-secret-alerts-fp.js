#!/usr/bin/env node

require('dotenv').config()
const pReduce = require('./lib/p-reduce');
const delay = require('delay');
const { Octokit } = require('@octokit/rest')


var buffer = ""
var base_url = ''
var owner = ''
var token_type = ''
const [, , ...args] = process.argv
//const owner = args[0]
if (args.length > 1)
  base_url = args[1]

token_type = args[0]
if (base_url.slice(-1) == '/')
  base_url = base_url.slice(0, -1)

if (base_url.length > 0) {
  octokit = new Octokit({
    auth: process.env.GH_AUTH_TOKEN,
    previews: ['dorian-preview'],
    baseUrl: base_url + '/api/v3'
  });
}
else {
  octokit = new Octokit({
    auth: process.env.GH_AUTH_TOKEN,
    previews: ['dorian-preview']
  });
}
//finding 
octokit.paginate("GET /organizations")
  .then(organizations =>
    pReduce(organizations, (organization) => {
      owner = organization.login

      return octokit
        .paginate(octokit.repos.listForOrg, {
          org: owner,
        })
        .then(repositories =>
          pReduce(repositories, (repository) => {
            if (repository.archived) {
              return Promise.resolve();
            }
            var repo = repository.name

            return octokit
              .paginate("GET /repos/:owner/:repo/secret-scanning/alerts?per_page=100", {
                owner: owner,
                repo: repo
              })
              .then(alerts => {

                if (alerts.length > 0) {

                  pReduce(alerts, (alert) => {
                    if (alert.secret_type == token_type) {
                      console.log(`${alert.secret_type} number ${alert.number} `)
                      octokit.request('PATCH /repos/:owner/:repo/secret-scanning/alerts/:alert_number', {
                        owner: owner,
                        repo: repo,
                        alert_number: alert.number,
                        state: 'resolved',
                        resolution: 'false_positive'
                      })
                        .then(resp => {
                          console.log(`${alert.secret_type} number ${alert.number} marked as false positive`)
                        })
                    }
                  })
                }
                delay(300);
              })
              .catch(error => {
                // console.error(`Failed for ${owner}/${repo}\n${error.message}\n${error.documentation_url}`)
              })
          })

        )
        .catch(error => {
          console.error(`Getting repositories for organization ${owner} failed.
    ${error.message} (${error.status})
    ${error.documentation_url}`)
        })
    }
    )
  )