let express = require('express');
let cors = require('cors');
let dotenv = require('dotenv');
dotenv.config();
let app = express();
let Mongo = require('mongodb');
const { query } = require('express');
let MongoClient = Mongo.MongoClient;
let mongouturl = process.env.LiveMongo;
let port = process.env.PORT || 5000 ;
let bodyParser = require('body-parser')
let db;

//middleware
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(cors());


app.get('/restloaction',(req,res)=>{
    db.collection('location').find().toArray((err,result)=>{
        if(err) {
            console.log(err , "err while listing");
            res.send("Error while connecting to  server :-(")
        }
        // let city =[] 
        // // let city =[]            
        // for(i=0;i<result.length;i++){
        //     if(city.indexOf(result[i].city_name) === -1){
        //         city.push(result[i].city_name)
        //     }
        // }
        // res.send(city);
        res.send(result);
    })
} 
)
app.get('/mealtype',(req,res)=>{
    db.collection('mealtype').find().toArray((err,result)=>{
        if(err) {
            console.log(err , "err while listing");
            res.send("Error while connecting to  server :-(")
        }
        res.send(result);
    })
} 
)

app.get('/listitem',(req,res)=>{
    db.collection('restaurantmenu').find().toArray((err,result)=>{
        if(err) {
            console.log(err , "err while listing");
            res.send("Error while connecting to  server :-(")
        }
        res.send(result);
    })
} 
)

app.get('/rest/:cityid',(req,res)=>{
    let city_id =Number(req.params.cityid);
    db.collection('restaurantdata').find({"state_id":city_id}).toArray((err,result)=>{
        if(err) {
            console.log(err , "err while listing");
            res.send("Error while connecting to  server :-(")
        }
        res.send(result)
    })
} 
)

app.get('/filter',(req,res) => {
    // console.log(req.query)
    let query = {};
    let sort = {cost:1}
    let mealId = Number(req.query.mealId);
    let cuisineId = Number(req.query.cuisineId);
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);
    let location = Number(req.query.location)
    // console.log(mealId);
    // console.log(
    //     cuisineId,lcost,hcost,location
    // );
    if(req.query.sort){
        sort={cost:req.query.sort}
    }

    if(hcost && lcost && cuisineId){
        query={
            "cuisines.cuisine_id":cuisineId,
            "mealTypes.mealtype_id":mealId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else if(hcost && lcost){
        query={
            "mealTypes.mealtype_id":mealId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else if(cuisineId){
        query={
            "mealTypes.mealtype_id":mealId,
            "cuisines.cuisine_id":cuisineId
        }
    }
    else{
        query={
            "mealTypes.mealtype_id":mealId
        }
    }
    console.log(query);
    db.collection('restaurantdata').find(query).sort(sort).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


app.get('/findmeal/:restid',((req,res)=>{
    let restid = Number(req.params.restid)

    db.collection('restaurantmenu').find({'restaurant_id':restid}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
}))

app.get('/find',((req,res)=>{
    // let mealid = Number(req.params.mealid)

    db.collection('restaurantdata').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
}))

app.get('/details/:restId',(req,res)=>{
    let restId = Number(req.params.restId)
    db.collection('restaurantdata').find({restaurant_id:restId}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


// app.get('/restaurants',(req,res)=>{
//     let stateId = Number(req.query.stateId);
//     let mealId = Number(req.query.mealId)
//     let query = {}
//     if(stateId){
//         query = {state_id:stateId}
//     }else if(mealId){
//         query = {"mealTypes.mealtype_id":mealId}
//     }else{
//         query = {}
//     }
//     db.collection('restaurantdata').find(query).toArray((err,result) => {
//         if(err) throw err;
//         res.send(result)
//     })
// })

app.post('/menuItem',(req,res) => {
    let cart = req.body.cartmenu
    // console.log(req.body);
    if(Array.isArray(cart)){
        db.collection('restaurantmenu').find({menu_id:{$in: cart}}).toArray((err,result) => {
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Invalid Input')
    }
     
})
app.post('/menuinrest',(req,res) => {
    let cart = req.body.restaurantid
    if(Array.isArray(cart)){
        db.collection('restaurantmenu').find({restaurant_id:{$in: cart}}).toArray((err,result) => {
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Invalid Input')
    }
     
})

MongoClient.connect(mongouturl,(err,client)=>{
    if(err) console.log('err while connect');
    db = client.db('Zomato');
  
    app.listen(port,()=>{
        console.log('servre is runnun in ' + port )
    })
    
})