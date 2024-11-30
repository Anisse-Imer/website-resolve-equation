const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const port = 3000;
const { job } = require("./scripts/calcul");

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

// Constante base de données
const { createClient } = require('redis');
client = async () => {
    let r = await createClient({
        password: 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
        socket: {
        host: 'cache',
        port: 6379
        }
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
    return r;
}

// On envoie l'equation dans un post - si il y a un erreur on affiche "equation invalide" sur la page (variable error)
app.post('/', async (req, res) => {
  try{  
    let redis = await client();
    let resultat = await job(req.body.equation, redis);
    console.log("POST :", req.body.equation, ":",resultat);
    res.render('index', { data: resultat, error : false});
  }
  catch(err){
    let resultat = {"res" : "", "equation" :"", "known" : new Map(), "unknown" : new Map()};
    res.render('index', { data: resultat, error : true});
  }
});

// Get à la première arrivée sur la page
app.get('/', async (req, res) => {
  let redis = await client();
  let resultat = await job("(6+6)", redis);
  res.render('index', { data: resultat, error : false});
});

app.listen(port, async () => {
  console.log(`Server listening at http://localhost:${port}`);
});