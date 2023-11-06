import os
import sys
import logging

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware


# *****************************************************************************
#                  Some global constants and variables
# *****************************************************************************


NAME = 'Informative app of the global food crisis'
VERSION = '1.1.0'
DESCRIPTION = """This microservice was designed to prove that the global food crisis is not primarily an issue of 
productivity but rather one of distribution, we can consider several key factors: Food Production Surplus, Food Wastage,
Income Inequality, Climate Change and Global Trade."""
DATA_PATH: str = 'data/'
URL_PREFIX: str = os.getenv("URL_PREFIX") or ""
SERVER_ADDRESS: str = os.getenv("SERVER_ADDRESS") or ""


# *****************************************************************************
#                  FastAPI entry point declaration
# *****************************************************************************


rootapp = FastAPI()

app = FastAPI(openapi_url='/specification')
app.add_middleware(CORSMiddleware, allow_origins=["*"], 
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(title=NAME, version=VERSION, 
        description=DESCRIPTION, routes=app.routes,)
    #openapi_schema["info"]["x-logo"] = {"url": "assets/digirent-logo.png"}
    #if SERVER_ADDRESS != "":
       #openapi_schema["servers"] = [
            #{"url": "http://digirent-ai.kube.isc.heia-fr.ch/" + URL_PREFIX, 
            #"description": "MS to predict best pub. strategy for a property."}
        #]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
rootapp.mount(URL_PREFIX, app)
logger = logging.getLogger("uvicorn.error")
logger.info('Starting app with URL_PREFIX=' + URL_PREFIX)


# *****************************************************************************
#                  Set the logging for the service
# *****************************************************************************


logger = logging.getLogger("uvicorn.error")
logger.info('Starting app with URL_PREFIX=' + URL_PREFIX)


# ******************************************************************************
#             Classes declaration - for input and output models
# ******************************************************************************


class parameters(BaseModel):
    #budget: Optional[int] = None


# *****************************************************************************
#                  Done once when micro-service is starting up
# *****************************************************************************


@rootapp.on_event("startup")
def initialization():
    #data = pd.read_csv("data/clean/merged/CPU.csv")  
    return None
    

# ******************************************************************************
#                  API Route definition
# ******************************************************************************


@app.get("/")
def info():
    return {'message': 'Welcome to the microservice on the global food crisis. Try out /showcase for the showcase and /docs for the doc.'}

@app.post("/build")
def none():
    return None

@app.get("/showcase")
def showcase():
    """
    Showcase website demonstrating the functionalities of the microservice.
    :return: HTML
    """
    logger.info("route '/showcase' called")

    return FileResponse(os.path.dirname(os.getcwd())+"/showcase/index.html")

@app.get("/assets/{filename}")
async def assets(filename: str):
    logger.info("route '/assets/{}' called".format(filename))

    return FileResponse(os.path.dirname(os.getcwd())+ "/showcase/assets/" + filename)


# ******************************************************************************
#                  API Functions
# ******************************************************************************
 
 
def none():
    return None