import os
import logging
import pandas as pd
import numpy as np

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
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
ISO_ref = pd.read_excel("data\cleaned\iso_list.xlsx")

# *****************************************************************************
#                  FastAPI entry point declaration
# *****************************************************************************

app = FastAPI(title=NAME, version=VERSION, 
        description=DESCRIPTION, openapi_url='/specification')

app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# *****************************************************************************
#                  Set the logging for the service
# *****************************************************************************

logger = logging.getLogger("uvicorn.error")
logger.info('Starting app with URL_PREFIX=' + URL_PREFIX)

# ******************************************************************************
#             Classes declaration - for input and output models
# ******************************************************************************

class CountryDataResponseModel(BaseModel):
    name: str
    iso2: str
    iso3: str
    population: list
    production: list
    import_quantity: list
    stock_variation: list
    export_quantity: list
    domestic_supply: list
    feed: list
    seed: list
    proteine_supply: list
    losses: list
    residuals: list
    food: list
    food_supply_kcal: list

class CountryDataResponse(BaseModel):
    country: CountryDataResponseModel

# *****************************************************************************
#                  Done once when micro-service is starting up
# *****************************************************************************

async def startup_event():
    return None

app.add_event_handler("startup", startup_event)

# ******************************************************************************
#                  API Route definition
# ******************************************************************************

@app.get("/")
def info():
    return {'message': 'Welcome to the microservice on the global food crisis. Try out /showcase for the showcase and /docs for the doc.'}

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

@app.get("/utilization-data/{country_iso}/{category}")
def utilization_data(country_iso:str, category:str):
    try:
        _, country = get_iso2_and_country(ISO_ref, country_iso)
        nutritional_data = pd.read_csv("data/cleaned/food_supply_country_cleaned.csv")
        filtered_nutritional = nutritional_data[(nutritional_data["country"] == country) & (nutritional_data["element"] == category) & (nutritional_data["year"] == 2019)]
        filtered_nutritional = filtered_nutritional.sort_values(by="value", ascending=False)
        json_data = filtered_nutritional.to_json(orient='records')
        return JSONResponse(content={'data': json_data})
    except FileNotFoundError:
        return {"error": "CSV file not found. Please ensure the file path is correct."}

@app.get("/undernourishement-data")
def undernourishement_data():
    try:
        undernourishement_data = pd.read_csv("data/cleaned/undernourished_rate_cleaned.csv")
        json_data = {}
        for _, row in undernourishement_data.iterrows():
            country_name = str(row["country"])
            iso2 = str(row["iso2"])
            iso3 = str(row["iso3"])
            values = [float(val.strip(" '")) for val in row["value"].strip("[]").split(",")]
            json_data[country_name] = {"iso2": iso2, "iso3": iso3, "values": values}
        return json_data
    except FileNotFoundError:
        return {"error": "CSV file not found. Please ensure the file path is correct."}

@app.get("/nutritional-data-country/{country_iso}")
def nutritional_data_country(country_iso:str):
    try:
        iso2, country = get_iso2_and_country(ISO_ref, country_iso)
        nutritional_data = pd.read_csv("data/cleaned/food_supply_country_cleaned.csv")
        filtered_nutrional = nutritional_data[nutritional_data["country"] == country]
        population_data = pd.read_csv("data/cleaned/population_cleaned.csv")
        filtered_population = population_data[population_data["country"] == country]["value"].to_list()
        undernourished_data = pd.read_csv("data/cleaned/severely_undernourished_people_years_cleaned.csv")
        filtered_undernourished = undernourished_data[undernourished_data["country"] == country]
        country_data = CountryDataResponseModel(
            name=country,
            iso2=iso2,
            iso3=country_iso,
            population=filtered_population,
            production=filter_df(filtered_nutrional, "Production"),
            import_quantity=filter_df(filtered_nutrional, "Import Quantity"),
            stock_variation=filter_df(filtered_nutrional, "Stock Variation"),
            export_quantity=filter_df(filtered_nutrional, "Export Quantity"),
            feed=filter_df(filtered_nutrional, "Feed"),
            losses=filter_df(filtered_nutrional, "Losses"),
            residuals=filter_df(filtered_nutrional, "Residuals"),
            seed=filter_df(filtered_nutrional, "Seed"),
            food=filter_df(filtered_nutrional, "Food"),
            domestic_supply=filter_df(filtered_nutrional, "Domestic supply quantity"),
            proteine_supply=filter_df(filtered_nutrional, "Protein supply quantity (g/capita/day)"),
            food_supply_kcal=filter_df(filtered_nutrional, "Food supply (kcal/capita/day)")
        )
        response_data = CountryDataResponse(country=country_data)
        return response_data
    except FileNotFoundError:
        return {"error": "CSV file not found. Please ensure the file path is correct."}

@app.get("/food-supply")
def food_supply():
    try:
        plan_supply = pd.read_csv("data/cleaned/plants_2019_cleaned.csv")
        pd.set_option('display.float_format', '{:.2f}'.format)
        condition = (plan_supply['element'] == 'Production')
        filtered_data = plan_supply.loc[condition]
        result = filtered_data.groupby('item')['value'].sum()
        return result
    except FileNotFoundError:
        return {"error": "CSV file not found. Please ensure the file path is correct."}

@app.get("/undernourishement-data-country/{country_iso}")
def undernourishement_data(country_iso):
    try:
        _, country = get_iso2_and_country(ISO_ref, country_iso)
        undernourishement_dataframe = pd.read_csv("data/cleaned/undernourished_rate_cleaned.csv")
        filtered_datafrane= undernourishement_dataframe[(undernourishement_dataframe["country"] == country)]
        json_data = {}
        for _, row in filtered_datafrane.iterrows():
            country_name = str(row["country"])
            values = [float(val.strip(" '")) for val in row["value"].strip("[]").split(",")]
            json_data[country_name] = values[5]
        return json_data
    except FileNotFoundError:
        return {"error": "CSV file not found. Please ensure the file path is correct."}

# ******************************************************************************
#                  API Utility functions
# ******************************************************************************

def filter_df(data:pd.DataFrame, element_name:str):
    return pd.Series([(row["item"], row["value"]) for _, row in data.iterrows() if row["element"].strip() == element_name]).tolist()

def get_iso2_and_country(df, iso3_code):
    row = df[df['iso3'].str.strip() == iso3_code]
    print("ROW",row)
    if not row.empty:
        iso2 = row['iso2'].values[0]
        country = row['country'].values[0]
        return iso2, country
    else:
        return None, None