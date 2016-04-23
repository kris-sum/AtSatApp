#!/usr/bin/env python
import os
import math
import time
import datetime
import json
import urllib2
import ephem
import cgi

degrees_per_radian = 180.0 / math.pi

apiresult = {}

home = ephem.Observer()
args = cgi.FieldStorage()
home.lon = args.getvalue('longitude','-3.475067')
home.lat = args.getvalue('latitude', '50.727231')
home.elevation = float(args.getvalue('altitude',31))
home.date = datetime.datetime.utcnow()

observer = {}
observer['longitude_dms']   = "%s" % home.lon
observer['latitude_dms']    = "%s" % home.lat
observer['altitude']        = home.elevation
apiresult['observer'] = observer

# do we need to grab new TLE data?
try:
    mtime = os.path.getmtime('iss_tle.txt')
except OSError:
    mtime = 0
if time.time() - mtime > 86400:
    # grab new TLE data
    # https://api.wheretheiss.at/v1/satellites/25544/tles
    # or scrape from http://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html
    tlejson = json.load(urllib2.urlopen('https://api.wheretheiss.at/v1/satellites/25544/tles'))
    with open('iss_tle.txt', 'w') as outfile:
        json.dump(tlejson,outfile)
else:
    tlejson = json.load(open('iss_tle.txt'))
        
iss = ephem.readtle('ISS',
    tlejson['line1'], #'1 25544U 98067A   15103.57745229  .00016717  00000-0  10270-3 0  9008',
    tlejson['line2'],#'2 25544  51.6453  46.8181 0005674 215.8114 144.2659 15.55622921 17982'
)
iss.compute(home)

data_iss = {}
data_iss['elevation']   = "%4.1f" % (iss.alt * degrees_per_radian);
data_iss['azimuth']     = "%5.1f" % (iss.az * degrees_per_radian);
apiresult['iss'] = data_iss

# list out planets
data_planets = {}
planetrybodies = ['Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']
for entity in planetrybodies:
    spaceentity = getattr(ephem, entity)()
    spaceentity.compute(home)
    spaceentity_data = {}
    spaceentity_data['elevation']   = "%4.1f" % (spaceentity.alt * degrees_per_radian);
    spaceentity_data['azimuth']     = "%4.1f" % (spaceentity.az * degrees_per_radian);
    data_planets[entity] = spaceentity_data
apiresult['planets']=data_planets

# list out stars
data_stars = {}
stars = ['Polaris','Mizar','Alioth','Megrez','Phecda','Merak','Dubhe']
for entity in stars:
    spaceentity = ephem.star(entity)
    spaceentity.compute(home)
    spaceentity_data = {}
    spaceentity_data['elevation']   = "%4.1f" % (spaceentity.alt * degrees_per_radian);
    spaceentity_data['azimuth']     = "%4.1f" % (spaceentity.az * degrees_per_radian);
    data_stars[entity] = spaceentity_data
apiresult['stars']=data_stars

# output

print "Access-Control-Allow-Origin: *"
print "Content-type: application/json\n\n"
print json.dumps(apiresult)
