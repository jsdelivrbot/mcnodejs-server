//Edit the password to be non-default.
var password = "password";

//DO NOT EDIT ANYTHING BELOW.
var WebsocketServer = require('ws').Server;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||  "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8000;

wss = new WebsocketServer({ port: port, host: ipaddress });

host = null;
addConnection = null;


wss.on('connection', function(ws)
{
	var isConnector = false;
	var isDead = false;

	ws.on('message', function(message)
	{
		if(message.toString() == "REGISTER " + password)
		{
			host = ws;
			console.log("New Host");
			ws.send("ACCEPT");
		} else if(message.toString() == "CONNECTOR")
		{
			ws.other = addConnection;
			
			/*
			ws.on('message', function(message)
			{
				ws.other.send(message);
			});
			*/
			console.log("Connection received");
			isConnector = true;
			addConnection.host = ws;

			for(var i = 0; i < addConnection.myData.length; i++)
			{
				ws.send(addConnection.myData[i]);
			}

		} else
		{
			//Minecraft Connection
			if(isDead) return;
			try
			{
				if(host == null) return;

				if(isConnector)
				{
					ws.other.send(message);
					return;
				}

				if(ws.host === undefined)
				{
					console.log("New Player Joining");
					ws.host = null;
					addConnection = ws;
					host.send("CONNECTION");
				}

				if(ws.host != null)
				{
					ws.host.send(message);
					return;	
				}

				if(ws.myData === undefined)
				{
					ws.myData = [message];
				} else ws.myData.push(message);
			} catch(ex)
			{
				isDead = true;
			}

			
		}
	});
	//ws.send("something");
});

console.log("Server bound.");