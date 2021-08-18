# Bulk marking of secret scanning alerts as FP

### Running the script
1. Clone this repo to your local machine
2. Create a file called .env 
3. Create a [GitHub Token](https://github.com/settings/tokens) which has the `repo` > `security_events` permission. (`repo` permission is needed for private repo)
4. Add the token to your .env file as shown `GH_AUTH_TOKEN= <insert token here>`
55. Run `npm install` to install node dependencies
6. Run `node mark-secret-alerts-fp.js <alert type> > output.csv` where `alert_type` is the type of alert you want to mark as false positive. Note, if SSO is enabled on your org, you will need to SSO enable your token.
    * Optionally, you can run `node get-secret-scanning-alerts.js <alert_type>  <http://enterprise.github.yourcompany.com> ' where the optional second parameter is your github enterprise base URL.   

### License
This project is licensed under the MIT License. 
