
const  promClient  =  require('prom-client');

const  register  = new  promClient.Register();
promclient.collectDefaultMetrics({register});

const  httpRequestsCounter  = new  promClient({
  name: "http",
  help:   "total   number  of  requets",
  lablenames:  ["method  "   ,  "route"    , "status"]
})

register.registerMetric(httRequestCounter)

//expose   /metrics  endpoint  for   prometheous
app.get('/metris'  ,  async(req , res)=>{res.set(
  'content-type' ,   register.contentType
)})


//prom  querrying 

/metrics
/target   >   heath  if up or  down  


//middlle  ware  



app.use((req ,  res  , next)=>{
    res.on('finish'  ,  ()=>{
        res.Register

        next();
    })
})