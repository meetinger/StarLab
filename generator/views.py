import json

from django.shortcuts import render

# Create your views here.
from generator.utils.converter import convert_table_to_track, get_column_from_table_dict, convert_to_starlab, load_files


def index(request):

    resp = request.GET.get('mass')

    mass = 1

    if not(resp is None):
        mass = float(resp)

    # print(mass)


    tables = load_files('generator/datasets/tracks/')


    if mass in tables:
        data = convert_table_to_track(tables[mass])
        track = data['track']
        initial_mass = data['initial_params']['initial_mass']

        ages = get_column_from_table_dict(track, 'star_age')
        mass_remnant_orig = get_column_from_table_dict(track, 'star_mass')
        x_orig = get_column_from_table_dict(track, 'log_Teff')
        y_orig = get_column_from_table_dict(track, 'log_L')
        phase_orig = get_column_from_table_dict(track, 'phase')

    # print(ages)

        converted = convert_to_starlab([ages, mass_remnant_orig, y_orig, x_orig, phase_orig], throttle=5)

        jsonchik = json.dumps(converted)

        # print(jsonchik)

        return render(request, 'index.html', context={'data': jsonchik, 'curMass': mass})
    else:
        return render(request, 'err.html')
    # return render(request, 'index.html')
