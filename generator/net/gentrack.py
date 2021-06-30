import torch
# import matplotlib.pyplot as plt
from generator.net.converter import convert_table_to_track, get_column_from_table_dict, scale_age, phase_to_str, convert_to_starlab, write_data_for_starlab


def gen_track(model, age=11465471475, initial_mass=1, device=torch.device("cpu"), step=100000000):
    ages = []
    if type(age) is int:
        ages = range(1, age, step)
    else:
        ages = age

    mass_remnant = []
    log_L = []
    log_Teff = []
    phase = []

    model.eval()
    model.to(device)

    track = []
    # counter = 0
    for i in range(0, len(ages)):
        # for i in ages:
        #     data = torch.Tensor([1, math.log10(ages[i]) / 2]).to(device)
        #     data = torch.Tensor([1, ages[i]]).to(device)

        # data = torch.Tensor(scale_input([mass, ages[i]])).to(device)
        # output = unscale_output(model(data).tolist())
        # print()
        data = torch.Tensor([initial_mass, scale_age(ages[i], ages[len(ages)-1])]).to(device)
        output = model(data).tolist()

        m = output[0]
        L = output[1]
        T = output[2]
        phs = output[3]
        # if (0 > L > 10) or (0 > T > 10):
        #     print("Skip")
        #     continue
        track.append(output)

        mass_remnant.append(m)
        log_L.append(L)
        log_Teff.append(T)
        phase.append(phs)
        # print(data)
        # print(output)
        if i % 10 == 0:
            print(i / len(ages) * 100, '%')
    return ages, mass_remnant, log_L, log_Teff, phase

    # print(log_L)

    # plt.ion()


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
