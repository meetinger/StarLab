import json
import os
import random
import math


def clean_split(str, delimiter, ex_chars=None):
    if ex_chars is None:
        ex_chars = ['']
    splitted = str.split(delimiter)
    cleaned = [s.strip() for s in splitted if not (s in ex_chars)]
    return cleaned


def read_table(path, header_line, delimiter=" ", header_params=None, max_line=None):
    # with open(path, 'r') as table:
    #     for _ in range(header):
    #         table.next()

    table = open(path, 'r').readlines()
    # print(table)
    # header = table[header_line - 1].split(delimiter)
    # header = [s.strip() for s in header if (s != '') and (s != '#')]

    header_orig = clean_split(table[header_line], delimiter=' ', ex_chars=['', '#'])

    header = header_orig

    header_indexes = list(range(0, len(header)))
    # print(header)
    # print(header_indexes)
    if not (header_params is None):
        header = header_params
        header_indexes = [i for i in range(len(header_orig)) if header_orig[i] in header]

    # header_dict = {i: for i in header}

    header_dict = dict(zip(header, header_indexes))

    # print(header_dict)

    # print(header)
    # print(header_indexes)

    # values = { i :[] for i in header}
    # print(values)

    res = []

    if max_line is None:
        max_line = len(table)

    for i in range(header_line + 1, max_line):
        line = clean_split(table[i], delimiter=' ', ex_chars=['', '#'])
        tmp = dict.fromkeys(header)
        for key in header:
            tmp[key] = line[header_dict[key]]
        res.append(tmp)
    return res


def convert_table_to_track(path, params=None, initial_params=None):
    if initial_params is None:
        initial_params = ['initial_mass']
    if params is None:
        params = ['star_age', 'star_mass', 'log_L', 'log_Teff', 'phase']

    raw_data = read_table(path, header_line=11, delimiter=" ", header_params=params)

    tmp_initial_data = []

    if initial_params:
        tmp_initial_data = read_table(path, header_line=6, delimiter=" ", header_params=initial_params, max_line=8)[0]

    initial_data = {i: float(tmp_initial_data[i]) for i in tmp_initial_data}

    tmp_data = []

    for line in raw_data:
        tmp = {i: float(line[i]) for i in line}
        tmp_data.append(tmp)

    data = {'initial_params': initial_data, 'track': tmp_data}

    return data
    # return data


def get_column_from_table_dict(data, key):
    tmp = [line[key] for line in data]
    return tmp


def phase_to_str(phase):
    arr = {
        -1: "PMS",
        0: "MS",
        2: "RGB",
        3: "CHeB",
        4: "EAGB",
        5: "TPAGB",
        6: "PAGB",

        7: "PAGB",
        8: "WR",

        9: "WR",
    }
    return arr.get(round(phase), phase)


def scale_age(x):
    # val = x / 2952141953419
    # val = ((x*(x+1000000000)*(x-2952141953419))/2952141953419**3)*1000000
    val = math.log10(x) / 2
    return val


def unscale_age(x1):
    val = (10 ** (x1 * 2))
    return val


def min_max_scale(x, xmin, xmax, a, b):
    x1 = a + (x - xmin) * (b - a) / (xmax - xmin)
    return x1


def min_max_unscale(x1, xmin, xmax, a, b):
    x = (x1 - a) * (xmax - xmin) / (b - a) + xmin
    return x


def scale(x, xmin, xmax):
    return min_max_scale(x, xmin, xmax, 0, 1)


def unscale(x1, xmin, xmax):
    return min_max_unscale(x1, xmin, xmax, 0, 1)


def scale_output(data):
    mass = scale(data[0], 0, 120)
    log_L = scale(data[1], -3.5, 6.5)
    log_Teff = scale(data[2], 3.5, 5.5)
    phase = scale(data[3], -1, 9)
    res = (mass, log_L, log_Teff, phase)
    return res


def unscale_output(data):
    mass = unscale(data[0], 0, 120)
    log_L = unscale(data[1], -3.5, 6.5)
    log_Teff = unscale(data[2], 3.5, 5.5)
    phase = unscale(data[3], -1, 9)
    res = (mass, log_L, log_Teff, phase)
    return res


def scale_input(data):
    mass = scale(data[0], 0, 120)
    age = scale_age(data[1])
    res = (mass, age)
    return res


def unscale_input(data):
    mass = unscale(data[0], 0, 120)
    age = unscale_age(data[1])
    res = (mass, age)
    return res


# disable datascaling
def create_dataset(data, dataset_obj=True, datascaling=False):
    initial_params = data['initial_params']
    track = data['track']

    # x = [(initial_params['initial_mass'], math.log10(i['star_age'])/2) for i in track]
    # x = [(initial_params['initial_mass'], i['star_age']) for i in track]

    if datascaling:
        x = [scale_input((initial_params['initial_mass'], scale_age(i['star_age']))) for i in track]

        y = [scale_output(tuple(i.values())[1::]) for i in track]

    else:
        x = [(initial_params['initial_mass'], scale_age(i['star_age'])) for i in track]
        y = [tuple(i.values())[1::] for i in track]
    # if(dataset_obj):
    #     tensor_x = torch.Tensor(x)
    #     tensor_y = torch.Tensor(y)
    #
    #     dataset = TensorDataset(tensor_x, tensor_y)
    #
    #     # dataloader = DataLoader(dataset)
    #     return dataset
    # else:
    #     return x, y
    # print(len(x), len(y))
    return x, y


# def split_dataset_x_y(x, y, amount):
#     full_size = len(x)
#
#     train_size = int(amount * full_size)
#     test_size = full_size - train_size
#
#     indexes = list(range(full_size))
#     random.shuffle(indexes)
#
#     x_train, y_train, x_test, y_train = [], [], [], []


def split_dataset_dict(data, amount=0.8):
    full_size = len(data)

    train_size = int(amount * full_size)
    test_size = full_size - train_size

    indexes = list(range(full_size))
    random.shuffle(indexes)

    if type(data) is dict:
        train_data = []
        test_data = []

        full_keys = data.keys()

        for i in indexes:
            if i < train_size:
                train_data.append({list(full_keys)[i]: data[list(full_keys)[i]]})
            else:
                test_data.append({list(full_keys)[i]: data[list(full_keys)[i]]})

        return (train_data, test_data)

    if (type(data) is list) or (type(data) is tuple):
        x, y = data
        x_train, y_train, x_test, y_test = [], [], [], []

        for i in indexes:
            if i < train_size:
                x_train.append(x[i])
                y_train.append(y[i])
            else:
                x_test.append(x[i])
                y_test.append(y[i])
        print(len(x_train), len(y_train), len(x_test), len(y_test))
        return (x_train, y_train, x_test, y_test)


def create_big_dataset(path):
    files = os.listdir(path)
    # tracks = [convert_table_to_track(dir+'/'+i) for i in files]
    tracks = []
    counter = 0

    for i in files:
        tmp = convert_table_to_track(path + '/' + i)
        tracks.append(tmp)
        counter = counter + 1
        print("Loading dataset, " + str(counter / len(files) * 100) + "% complete")

    # zipped_dataset = []
    #
    # for i in tracks:
    #     tmp_x, tmp_y = create_dataset(i, False)
    #     tmp = dict(zip(tmp_x, tmp_y))
    #     zipped_dataset.append(tmp)

    arr_x = []
    arr_y = []

    for i in tracks:
        tmp_x, tmp_y = create_dataset(i, False)
        arr_x = arr_x + tmp_x
        arr_y = arr_y + tmp_y

    return arr_x, arr_y


def convert_to_starlab(data, throttle = 1):
    def get_radius(L0, T):
        L = 3.828 * (10 ** 26) * L0
        R = math.sqrt(L / (4 * math.pi * 5.67 * (10 ** -8) * (T ** 4)))
        R0 = R / 696340000
        return R0

    converted = []
    for i in range(0, len(data[0])):
        # print(len(data[0]))
        if i % throttle==0:
            age = data[0][i]
            mass_remnant = data[1][i]
            L0 = 10**data[2][i]
            T = 10**data[3][i]
            stage = phase_to_str(data[4][i])

            converted.append({
                'structure': False,
                'properties': {
                    'luminosity': L0,
                    'temperature': T,
                    'stage': stage,
                    'age':age,
                    'radius':get_radius(L0,T),
                    'mass': mass_remnant
                }
            })

    return converted


def write_data_for_starlab(converted):
    json_obj = json.dumps(converted)

    f = open("db.js", "w")

    f.write("let data = " + json_obj)

def load_files(path):
    tables = {}

    files = os.listdir(path)
    for i in files:
        mass = float(read_table(path+'/'+i, header_line=6, delimiter=" ", header_params=['initial_mass'], max_line=8)[0]['initial_mass'])
        tables[mass] = path+'/'+i

    return tables