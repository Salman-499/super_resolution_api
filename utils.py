import ee 

def image_to_map_id(image_name, vis_params={}):
    """
    Converts an image name to a map ID.

    Args:
        image_name (str): The name of the image.
        vis_params (dict, optional): Visualization parameters for the image. Defaults to {}.

    Returns:
        dict: A dictionary containing the map ID URL.

    Raises:
        Exception: If an error occurs during the conversion process.
    """
    try:
        ee_image = ee.Image(image_name)
        map_info = ee_image.getMapId(vis_params)
        return {
            'url': map_info['tile_fetcher'].url_format,
        }
    except Exception as e:
        return {
            'errMsg': str(e)
        }
    
def mean_image_in_collection_to_map_id(collection_name, vis_params={}, date_from=None, date_to=None):
    """
    Converts the mean image in the specified image collection to a map ID.

    Args:
        collection_name (str): The name of the image collection.
        vis_params (dict, optional): Visualization parameters for the map ID. Defaults to an empty dictionary.
        date_from (str, optional): The start date for filtering the image collection. Defaults to None.
        date_to (str, optional): The end date for filtering the image collection. Defaults to None.

    Returns:
        str: The map ID of the mean image.

    Raises:
        Exception: If any error occurs during the process.
    """
    try:
        if date_from and date_to:
            ee_collection = ee.ImageCollection(collection_name).filter(ee.Filter.date(date_from, date_to))
        else:
            ee_collection = ee.ImageCollection(collection_name)
        return image_to_map_id(ee.Image(ee_collection.mean()), vis_params)
    except Exception as e:
        raise Exception(str(e))
    
def get_time_series_by_collection_and_index(collection_name, index_name, scale, coords=[], date_from=None, date_to=None,
                                            reducer=None):
    """
    Retrieves a time series of index values for a given collection and index name within a specified region.

    Args:
        collection_name (str): The name of the image collection.
        index_name (str): The name of the index to retrieve.
        scale (int): The scale in meters for the spatial resolution.
        coords (list, optional): The coordinates of the region of interest. Defaults to an empty list.
        date_from (str, optional): The start date for filtering the image collection. Defaults to None.
        date_to (str, optional): The end date for filtering the image collection. Defaults to None.
        reducer (str, optional): The reducer function to apply when reducing the image collection. Defaults to None.

    Returns:
        dict: A dictionary containing the time series of index values.

    Raises:
        Exception: If an error occurs during the retrieval process.

    """
    try:
        geometry = None
        if isinstance(coords[0], list):
            geometry = ee.Geometry.Polygon(coords)
        else:
            geometry = ee.Geometry.Point(coords)
        if index_name:
            index_collection = ee.ImageCollection(collection_name).filterDate(date_from, date_to).select(index_name)
        else:
            index_collection = ee.ImageCollection(collection_name).filterDate(date_from, date_to)

        def get_index(image):
            """
            Retrieves the index value for a given image.

            Args:
                image (ee.Image): The image to retrieve the index value from.

            Returns:
                ee.Image: An image with the index value set as a property.

            """
            if reducer:
                the_reducer = eval("ee.Reducer." + reducer + "()")
            else:
                the_reducer = ee.Reducer.mean()
            if index_name:
                index_value = image.clip(geometry).reduceRegion(the_reducer, geometry, scale, maxPixels=1.0E13).get(index_name)
            else:
                index_value = image.reduceRegion(the_reducer, geometry, scale, maxPixels=1.0E13)
            return ee.Image().set('indexValue', [ee.Number(image.get('system:time_start')), index_value])

        return {
            'timeseries': index_collection.map(get_index).aggregate_array('indexValue').getInfo()
        }
    except Exception as e:
        print(str(e))
        raise Exception(str(e))

def list_available_bands(name, is_image):
    """
    Returns a dictionary containing the available bands of an Earth Engine image or image collection.

    Parameters:
    - name (str): The name of the Earth Engine image or image collection.
    - is_image (bool): True if the input is an image, False if it is an image collection.

    Returns:
    A dictionary with the following keys:
    - 'bands': A list of available band names.
    - 'imageName': The name of the input image or image collection.
    """
    if is_image:
        ee_image = ee.Image(name)
    else:
        ee_image = ee.ImageCollection(name).first()
    return {
        'bands': ee_image.bandNames().getInfo(),
        'imageName': name
    }