# generates documentation via jsdoc

if [ ! -d ./node_modules/jaguarjs-jsdoc ]; then
    npm install https://github.com/JacobFischer/jaguarjs-jsdoc.git
fi

if [ ! -d ./node_modules/jsdoc ]; then
    npm install jsdoc
fi

cat > conf.json <<- EOM
{
    "templates": {
        "applicationName": "netlinkwrapper Documentation",
        "meta": {
            "title": "netlinkwrapper Documentation",
            "description": "Documentation for the netlinkwrapper Node.js module",
            "footer": "&copy; Jacob Fischer",
            "noSourceFiles": true
        }
    }
}
EOM

rm -rf out

./node_modules/.bin/jsdoc main.js -r ./README.md -t node_modules/jaguarjs-jsdoc -c conf.json

rm conf.json
