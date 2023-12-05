import os
import sys
import json
import logging
import pandas as pd
import numpy as np

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

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
ISO_ref = pd.read_excel("data\iso_list.xlsx")

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
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
rootapp.mount(URL_PREFIX, app)

# *****************************************************************************
#                  Set the logging for the service
# *****************************************************************************

logger = logging.getLogger("uvicorn.error")
logger.info('Starting app with URL_PREFIX=' + URL_PREFIX)

# ******************************************************************************
#             Classes declaration - for input and output models
# ******************************************************************************


# *****************************************************************************
#                  Done once when micro-service is starting up
# *****************************************************************************

async def startup_event():
    return None   

rootapp.add_event_handler("startup", startup_event)

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
#                  API Endpoints
# ******************************************************************************
 
@app.get("/nutritional-data-country/{country_iso}")
def nutritional_data_country(country_iso:str) -> str:
    iso2, country = get_iso2_and_country(ISO_ref, country_iso)
    nutritional_data = pd.read_csv("data/cleaned/food_supply_country_cleaned.csv")
    filtered_nutrional = nutritional_data[nutritional_data["country"] == country]
    population_data = pd.read_csv("data/cleaned/population_cleaned.csv")
    filtered_population = population_data[population_data["country"] == country]["value"].to_list()
    undernourished_data = pd.read_csv("data\cleaned\severely_undernourished_people_years_cleaned.csv")
    filtered_undernourished = undernourished_data[undernourished_data["country"] == country]
    response_data = {
        "country": {
            "name": country,
            "iso2": iso2,
            "iso3": country_iso,
            "population": filtered_population,
            "population_undernourished": filter_df(filtered_undernourished, "Value"),
            "production": filter_df(filtered_nutrional, "Production"),
            "import_quantity": filter_df(filtered_nutrional, "Import Quantity"),
            "stock_variation": filter_df(filtered_nutrional, "Stock Variation"),
            "export_quantity": filter_df(filtered_nutrional, "Export Quantity"),
            "domestic_supply": filter_df(filtered_nutrional, "Domestic supply quantity"),
            "feed": filter_df(filtered_nutrional, "Feed"),
            "seed": filter_df(filtered_nutrional, "Seed"),
            "proteine_supply": filter_df(filtered_nutrional, "Protein supply quantity (g/capita/day)"),
            "losses": filter_df(filtered_nutrional, "Losses"),
            "residuals": filter_df(filtered_nutrional, "Residuals"),
            "food_supply_kcal": filter_df(filtered_nutrional, "Food supply (kcal/capita/day)")
        }
    }
    return json.dumps(response_data)

@app.get("/undernourishement-data")
def nutritional_data_country():
    undernourishement_data = pd.read_csv("data/cleaned/undernourished_rate_cleaned.csv")
    result_dict = undernourishement_data.set_index('country')[['iso2', 'iso3', 'value']].to_dict(orient='index')
    return json.dumps(result_dict)
# ******************************************************************************
#                  API Utility functions
# ******************************************************************************

def filter_df(data:pd.DataFrame, element_name:str):
    return pd.Series([(row["item"], row["value"]) for _, row in data.iterrows() if row["element"].strip() == element_name]).tolist()

def get_iso2_and_country(df, iso3_code):
    row = df[df['iso3'].str.strip() == iso3_code]
    if not row.empty:
        iso2 = row['iso2'].values[0].strip()
        country = row['country'].values[0].strip()
        return iso2, country
    else:
        return None, None

'''nutritional_data[nutritional_data["country"] == country_iso]
exported_items = ['Wheat and products', 'Fruits, other', 'Onions', 'Molluscs, Other',
       'Groundnuts', 'Pelagic Fish', 'Bananas', 'Cephalopods',
       'Cocoa Beans and products', 'Beans', 'Vegetables, other',
       'Crustaceans', 'Marine Fish, Other', 'Pulses, Other and products',
       'Sugar (Raw Equivalent)', 'Cloves', 'Maize and products',
       'Nuts and products', 'Potatoes and products',
       'Coffee and products', 'Demersal Fish', 'Palm Oil',
       'Spices, Other', 'Peas', 'Pepper'] 

domestic_supply_quantity = food_supply_df[(food_supply_df.item.isin(exported_items))&(food_supply_df.country.isin(countries))&(food_supply_df.year==2019)&(food_supply_df.element=="Domestic supply quantity")].reset_index(drop=True)
other_uses = food_supply_df[(food_supply_df.item.isin(exported_items))&(food_supply_df.country.isin(countries))&(food_supply_df.year==2019)&(food_supply_df.element=="Other uses (non-food)")].reset_index(drop=True)

x5 = df_plants_2014[(df_plants_2014.element=="Food")].value.sum()  
x6 = df_plants_2019[(df_plants_2019.element=="Food")].value.sum()  
x7 = df_plants_2014[(df_plants_2014.element=="Feed")].value.sum()  
x8 = df_plants_2019[(df_plants_2019.element=="Feed")].value.sum()  
x9 = df_plants_2014[(df_plants_2014.element=="Losses")].value.sum()  
x10 = df_plants_2019[(df_plants_2019.element=="Losses")].value.sum()  
x11 = df_plants_2014[(df_plants_2014.element=="Other uses (non-food)")].value.sum()  
x12 = df_plants_2019[(df_plants_2019.element=="Other uses (non-food)")].value.sum()  
ani_domesticsupply_2014 = df_animals_2014[(df_animals_2014.element=="Domestic supply quantity")]  
ani_domesticsupply_2019 = df_animals_2019[(df_animals_2019.element=="Domestic supply quantity")] 
food_ratio_2014 = x5 / xtot1 * 100  
feed_ratio_2014 = x7 / xtot1 * 100  
losses_ratio_2014 = x9 / xtot1 * 100  
other_uses_ratio_2014 = x11 / xtot1 * 100 
food_ratio_2019 = x6 / xtot2 * 100  
feed_ratio_2019 = x8 / xtot2 * 100  
losses_ratio_2019 = x10 / xtot2 * 100  
other_uses_ratio_2019 = x12 / xtot2 * 100 

items = ['Rice and products', 'Bananas', 'Sugar (Raw Equivalent)',
       'Vegetables, other', 'Pineapples and products', 'Pelagic Fish',
       'Wheat and products', 'Palm Oil', 'Fruits, other', 'Groundnuts',
       'Onions', 'Coffee and products', 'Sesame seed',
       'Maize and products', 'Bovine Meat', 'Crustaceans',
       'Potatoes and products', 'Coconuts - Incl Copra',
       'Nuts and products', 'Sweeteners, Other', 'Alcohol, Non-Food',
       'Pulses, Other and products', 'Tea (including mate)',
       'Oilcrops Oil, Other', 'Coconut Oil']
highest_200_imports_2019 = food_supply_df[(food_supply_df.element=='Import Quantity')&(food_supply_df.year==2019)&(food_supply_df.item.isin(items))].sort_values(by='value', ascending=False).head(200).reset_index(drop=True)c
'''
