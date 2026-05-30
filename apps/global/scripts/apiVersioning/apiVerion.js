


const   urlVersioning   =   (version)=> (req  ,  res ,  next)=>{
    
    if(req.path.startsWith('/api/${version}')){

        next();

    }  else  {

        res.status(404).json({

            sucess: false,
            Error:  "APi    Version   Not Supported"

        });
    }
};


const   headerVersioning  =  (version)  => (req  , res , next) =>{
    if(req.get('Accept-Version') === version){
        next();
    } else  {
        res.status(400).json({
            sucess:  false,
            Error:  "Version   Not  Suported"
        });
    }
};

const  contentTypeVersioning   =  (version)  =>  (req  , res  , next)=>{

    const  contentType   =  req.get('content-Type');

    if(contentType  &&  contentType.includes('apllication/vnd.api.${version}+json')){
        next();
    }  else  {

    }
};


//usage  
app.use('/api/v1'  ,  urlVersioning('v1'));

module.exports =  {
    contentTypeVersioning,
    headerVersioning,
    urlVersioning
};