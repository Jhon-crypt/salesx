# Heroku Deployment Instructions

## Prerequisites
- [Heroku account](https://signup.heroku.com/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## Deployment Steps

1. Login to Heroku CLI:
   ```
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

3. Set up environment variables on Heroku:
   ```
   heroku config:set NODE_ENV=production
   ```
   
   Add any other environment variables from your .env file:
   ```
   heroku config:set DB_CONNECTION_STRING=your_db_connection_string
   ```

4. Deploy to Heroku:
   ```
   git push heroku main
   ```
   
   If your branch is not named main, use:
   ```
   git push heroku your-branch-name:main
   ```

5. Open your app:
   ```
   heroku open
   ```

## Troubleshooting

- Check logs if there are any issues:
  ```
  heroku logs --tail
  ```

- Restart the app if needed:
  ```
  heroku restart
  ```

## Database Configuration

If you're using an external database, make sure to:
1. Configure the database connection string in Heroku environment variables
2. Update your connection logic to use SSL if connecting to external PostgreSQL databases

## Scale Your App

To scale your app, you can use:
```
heroku ps:scale web=1
``` 