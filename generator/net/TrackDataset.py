from torch.utils import data


class TrackDataset(data.Dataset):
    def __init__(self, X, Y):
        self.X = X                           # set data
        self.Y = Y                           # set lables

    def __len__(self):
        return len(self.X)                   # return length

    def __getitem__(self, idx):
        # return torch.tensor([self.X[idx], self.Y[idx]]) # return list of batch data [data, labels]
        return [self.X[idx], self.Y[idx]]