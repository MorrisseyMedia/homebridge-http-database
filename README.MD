# homebridge-http-database

fork of [homebridge-netrunner-http-db](https://www.npmjs.com/package/homebridge-netrunner-http-db)

I mostly made this to have error logs translated (using google translate) in english as opposed to russian
I might make future updates

## Installation

1. Install this plugin using:

```
npm i homebridge-http-database -g
```

2. Edit `config.json` and add the data base path.
3. Run Homebridge

### config.json example

```
{
    "accessory": "HTTP Database",
    "name": "Database Name",
    "db_path": "/home/pi/HTTPDB"
}
```
