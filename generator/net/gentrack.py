# import matplotlib.pyplot as plt
from generator.net.converter import convert_table_to_track, get_column_from_table_dict, scale_age, phase_to_str, \
    convert_to_starlab, write_data_for_starlab, load_files


def smooth_track(track, smooth_period=10, use_arithmetical_mean=False):
    star_age = get_column_from_table_dict(track, 'star_age')
    star_mass = get_column_from_table_dict(track, 'star_mass')
    log_L = get_column_from_table_dict(track, 'log_L')
    log_Teff = get_column_from_table_dict(track, 'log_Teff')
    phase = get_column_from_table_dict(track, 'phase')

    smoothed = []

    max_len = len(track)
    if not use_arithmetical_mean:
        #moving average
        for i in range(0, max_len+smooth_period):
            slice_bound_left = max(1, i-smooth_period)
            slice_bound_right = min(max(i, 2), max_len)
            slice_size = slice_bound_right-slice_bound_left
            star_age_tmp = star_age[slice_bound_left:slice_bound_right]
            star_mass_tmp = star_mass[slice_bound_left:slice_bound_right]
            log_L_tmp = log_L[slice_bound_left:slice_bound_right]
            log_Teff_tmp = log_Teff[slice_bound_left:slice_bound_right]
            tmp = {
                'star_age': sum(star_age_tmp)/slice_size,
                'star_mass': sum(star_mass_tmp)/slice_size,
                'log_L': sum(log_L_tmp)/slice_size,
                'log_Teff': sum(log_Teff_tmp)/slice_size,
                'phase': phase[min(i, max_len-1)]
            }
            smoothed.append(tmp)
    else:
        for i in range(smooth_period, max_len, smooth_period):
            slice_bound_left = i-smooth_period
            slice_bound_right = i
            if i > (max_len - smooth_period):
                slice_bound_right = max_len
                slice_bound_left = i
            slice_size = slice_bound_right-slice_bound_left
            star_age_tmp = star_age[slice_bound_left:slice_bound_right]
            star_mass_tmp = star_mass[slice_bound_left:slice_bound_right]
            log_L_tmp = log_L[slice_bound_left:slice_bound_right]
            log_Teff_tmp = log_Teff[slice_bound_left:slice_bound_right]
            tmp = {
                'star_age': sum(star_age_tmp)/slice_size,
                'star_mass': sum(star_mass_tmp)/slice_size,
                'log_L': sum(log_L_tmp)/slice_size,
                'log_Teff': sum(log_Teff_tmp)/slice_size,
                'phase': phase[i]
            }
            smoothed.append(tmp)

    return smoothed

def interpolate(path, mass, paths = None):
    if paths is None:
        paths = load_files(path)

    masses = list(paths.keys())
    # print(masses)

    mass_a, mass_b = masses[0], masses[1]
    for i in range(1, len(masses)):
        if masses[i - 1] <= mass <= masses[i]:
            mass_a, mass_b = masses[i - 1], masses[i]

    # if mass_a == mass:
    #     mass_a = masses[masses.index(mass_a) - 1]


    track_a = convert_table_to_track(paths[mass_a])['track']

    track_b = convert_table_to_track(paths[mass_b])['track']

    abs_a = (mass - mass_a)
    abs_a_b = (mass_b - mass_a)

    k_mass = abs_a/abs_a_b

    def linear_scale(xmin, xmax, k):
        return abs(xmax - xmin) * k + xmin

    max_len = min(len(track_a), len(track_b))

    interpolated = []

    for i in range(0, max_len):
        cur_a = track_a[i]
        cur_b = track_b[i]

        star_age = linear_scale(cur_a['star_age'], cur_b['star_age'], k_mass)
        star_mass = linear_scale(cur_a['star_mass'], cur_b['star_mass'], k_mass)
        log_L = linear_scale(cur_a['log_L'], cur_b['log_L'], k_mass)
        log_Teff = linear_scale(cur_a['log_Teff'], cur_b['log_Teff'], k_mass)
        phase = int(linear_scale(cur_a['phase'], cur_b['phase'], k_mass))

        tmp = {
            'star_age': star_age,
            'star_mass': star_mass,
            'log_L': log_L,
            'log_Teff': log_Teff,
            'phase': phase
        }

        interpolated.append(tmp)

    # print(a, b)
    return interpolated

def gen_track_by_interpolator(path, mass, smooth_period=10, use_arithmetical_mean=False, paths = None):
    track = interpolate(path=path, mass=mass, paths=paths)
    smoothed = smooth_track(track=track, smooth_period=smooth_period, use_arithmetical_mean=use_arithmetical_mean)
    return smoothed
# def compare_tracks(model, path, age=11465471475, device=torch.device("cpu"), draw_phases=True):
#     data = convert_table_to_track(path)
#     track = data['track']
#     initial_mass = data['initial_params']['initial_mass']
#     # print(initial_mass)
#     mass_remnant_orig = get_column_from_table_dict(track, 'star_mass')
#     x_orig = get_column_from_table_dict(track, 'log_Teff')
#     y_orig = get_column_from_table_dict(track, 'log_L')
#     phase_orig = get_column_from_table_dict(track, 'phase')
#
#     ages, mass_remnant, y, x, phase = gen_track(model=model, age=get_column_from_table_dict(track, 'star_age'), initial_mass=initial_mass, device=device)
#
#     # print(len(ages), len(mass_remnant))
#
#     str_phase_orig = list(map(phase_to_str, phase_orig))
#     str_phase = list(map(phase_to_str, phase_orig))
#
#     # print(str_phase_orig)
#     # print(str_phase)
#
#
#     plt.scatter(x_orig, y_orig, label='Original', color='blue')
#     plt.xlabel('log_Teff')
#     plt.ylabel('log_L')
#
#
#     plt.scatter(x, y, label='Generated', color='red')
#     plt.legend()
#     plt.gca().invert_xaxis()
#
#     if draw_phases:
#         last_phase = ""
#         for i in range(0, len(x)):
#             if last_phase != str_phase[i]:
#                 plt.text(x[i], y[i], str_phase[i], color='red', bbox=dict(facecolor='white', edgecolor='red'))
#                 last_phase = str_phase[i]
#         last_phase = ""
#         for i in range(0, len(x_orig)):
#             if last_phase != str_phase_orig[i]:
#                 plt.text(x_orig[i], y_orig[i], str_phase_orig[i], color='blue',bbox=dict(facecolor='white', edgecolor='blue'))
#                 last_phase = str_phase_orig[i]
#
#     # convert_to_starlab([ages, mass_remnant, y, x, phase], throttle=5)
#
#     write_data_for_starlab(convert_to_starlab([ages, mass_remnant_orig, y_orig, x_orig, phase_orig], throttle=5))
#
#     plt.show()

# net = Net()
#
# net.load_state_dict(torch.load('model.pt'))
#
# net.eval()
# compare_tracks(model=net, path='datasets/tracks/0010000M.track.eep', device=torch.device("cuda"))
