const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1P06IlDFwmx0ADLJIaUAUDckyiRkUp8l-ju5XSEonulA';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  arr = '['
  obj = '{'

  for(i=1; i<rows.length; i++) {
    obj = '{'
    if(i !== 1)
      arr += ',';
    let row = rows[i]
    for(l=0; l<rows[0].length; l++){
      if(l!==0)
        obj += ',';
      obj += ('"'+rows[0][l]+'":"'+row[l]+'"')
    }
    obj += '}'
    arr += obj
  }
  arr += ']'
  final = JSON.parse(arr)
  res.json(final)
}
app.get('/api', onGet);


async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.

  res.json( { status: 'unimplemented'} );
}
app.post('/api', jsonParser, onPost);

async function onPost(req, res) {
  const messageBody = req.body;

  const result = await sheet.getRows();
  const rows = result.rows;

  // TODO(you): Implement onPost.
  let append = []
  for(let i=0; i<rows[0].length; i++){
    append[i] = messageBody[rows[0][i]];
  }
  await sheet.appendRow(append)
  res.json( { status: 'success'} );
}
app.post('/api', jsonParser, onPost);


async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  const result = await sheet.getRows();
  const rows = result.rows;

  var final=[];
  var keys = Object.keys(messageBody)
  console.log(keys)
  // TODO(you): Implement onPatch.
  for(i=0;i<rows[0].length;i++)
    if(column === rows[0][i])
      break;
  for(j=0;j<rows[0].length;j++)
    if(keys[0] === rows[0][j])
      break;
  for(idx=1;idx<rows.length;idx++)
    if(value === rows[idx][i])
      break
  rows[idx][j] = messageBody[keys[0]]; 

  await sheet.setRow(idx,rows[idx]);
  res.json( { status: 'success'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);


async function onDelete(req, res)
{
  const column = req.params.column;
  const value = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows;
  let data = '';
  const log = [];
  for (let i = 1; i < rows.length; i++)
  {
    data = '{'
    for (let j = 0; j < rows[0].length; j++)
    {
      if (j < rows[0].length)
        data = data + '"' + rows[0][j] + '"' + ': ';
      data = data + '"' + rows[i][j] + '"';
      if (j < rows[0].length - 1)
        data += ',';
    }
    data += '}'
    const body = JSON.parse(data);
    log.push(body);
  }

  // TODO(you): Implement onDelete.
  const index = log.map(function(item) {
    return item[column];
  }).indexOf(value);
  if (index !== -1)
  {
    await sheet.deleteRow(index + 1);
  }

  res.json({
    response: "success"
  });
}
app.delete('/api/:column/:value', onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
