import json

import torch
from django.shortcuts import render

# Create your views here.
from generator.net.converter import convert_table_to_track, get_column_from_table_dict, convert_to_starlab, load_files


def index(request):
    mass = request.GET.get('mass')
    if mass is None:
        mass = 1.0
    mass = float(mass)

    isNeuruonal = request.GET.get('neuronal')

    print(isNeuruonal)

    tables = load_files('generator/datasets/tracks/')

    # initial_mass = data['initial_params']['initial_mass']

    available_masses = sorted(tables.keys())

    if mass in tables:
        data = convert_table_to_track(tables[mass])
        track = data['track']
        ages = get_column_from_table_dict(track, 'star_age')
        mass_remnant_orig = get_column_from_table_dict(track, 'star_mass')
        x_orig = get_column_from_table_dict(track, 'log_Teff')
        y_orig = get_column_from_table_dict(track, 'log_L')
        phase_orig = get_column_from_table_dict(track, 'phase')

        # print(ages)

        converted = convert_to_starlab([ages, mass_remnant_orig, y_orig, x_orig, phase_orig], throttle=5)

        jsonchik = json.dumps(converted)

        # print(jsonchik)

        return render(request, 'index.html',
                      context={'data': jsonchik, 'curMass': mass, 'masses': available_masses,
                               'generated': "MESA MIST"})
    else:

        return render(request, 'err.html')
    # return render(request, 'index.html')
