import json
import time

from django.shortcuts import render

# Create your views here.
from generator.net.converter import convert_table_to_track, get_column_from_table_dict, convert_to_starlab, load_files
from generator.net.gentrack import gen_track_by_interpolator

tables = load_files('generator/datasets/tracks/', use_file_names=True)

def index(request):
    mass = request.GET.get('mass')
    if mass is None:
        mass = 1.0
    try:
        mass = float(mass)
    except ValueError:
        mass = 1.0
        
    mass = min(max(mass, 0.1), 120)

    # start_time = time.time()
    # print("--- %s seconds ---" % (time.time() - start_time))

    # initial_mass = data['initial_params']['initial_mass']

    available_masses = sorted(tables.keys())


    # data = convert_table_to_track(tables[mass])
    # track = data['track']

    track = gen_track_by_interpolator('generator/datasets/tracks/', mass, smooth_period=10, use_arithmetical_mean=False, paths=tables)

    ages = get_column_from_table_dict(track, 'star_age')
    mass_remnant_orig = get_column_from_table_dict(track, 'star_mass')
    x_orig = get_column_from_table_dict(track, 'log_Teff')
    y_orig = get_column_from_table_dict(track, 'log_L')
    phase_orig = get_column_from_table_dict(track, 'phase')

    # print(ages)

    converted = convert_to_starlab([ages, mass_remnant_orig, y_orig, x_orig, phase_orig], throttle=1)

    jsonchik = json.dumps(converted)
    generated_by = ("Generated by MESA MIST" if (mass in tables) else "Generated by MESA MIST(interpolated)")
    # print(jsonchik)

    return render(request, 'index.html',
                  context={'data': jsonchik, 'curMass': mass, 'masses': available_masses,
                           'generated': generated_by})
    # else:
    #
    # return render(request, 'err.html')
    # return render(request, 'index.html')
