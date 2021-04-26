import torch.nn as nn



class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(2, 50),
            nn.Tanh(),

            nn.Linear(50, 100),
            nn.Tanh(),

            nn.Linear(100, 250),
            nn.Tanh(),

            nn.Linear(250, 400),
            nn.Tanh(),

            nn.Linear(400, 4),
        )
        # self.ce = nn.CrossEntropyLoss()

    def forward(self, x):
        return self.layers(x)

