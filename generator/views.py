import json
import time

from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from django.views.decorators.csrf import csrf_exempt

from generator.net.converter import convert_table_to_track, get_column_from_table_dict, convert_to_starlab, load_files
from generator.net.gentrack import gen_track_by_interpolator

tables = load_files('generator/datasets/tracks/', use_file_names=True)

def index(request):
    return render(request, 'index.html')

@csrf_exempt
def get_data(request):

    req_body = json.loads(request.body)

    mass = req_body['mass']


    if mass is None:
        mass = 1.0
    try:
        mass = float(mass)
    except ValueError:
        mass = 1.0

    mass = min(max(mass, 0.1), 120)


    available_masses = sorted(tables.keys())


    track = gen_track_by_interpolator('generator/datasets/tracks/', mass, smooth_period=10, use_arithmetical_mean=False,
                                      paths=tables)

    ages = get_column_from_table_dict(track, 'star_age')
    mass_remnant_orig = get_column_from_table_dict(track, 'star_mass')
    x_orig = get_column_from_table_dict(track, 'log_Teff')
    y_orig = get_column_from_table_dict(track, 'log_L')
    phase_orig = get_column_from_table_dict(track, 'phase')

    # print(ages)

    converted = convert_to_starlab([ages, mass_remnant_orig, y_orig, x_orig, phase_orig], throttle=1)


    generated_by = ("Generated by MESA MIST" if (mass in tables) else "Generated by MESA MIST(interpolated)")

    dictionary = {'data': converted, 'curMass': mass, 'masses': available_masses,
                           'generated': generated_by}
    return HttpResponse(json.dumps(dictionary), content_type="application/json")