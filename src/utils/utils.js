var utils = {
  reverseGC(lat,lon){

    var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}6&lon={lon}'
    url = url.replace('{lat}',lat)
    url = url.replace('{lon}',lon)
    return fetch(url).then((res) => res.json());
  },


};

module.exports = utils;
