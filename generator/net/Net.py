import torch.nn as nn


class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.layers1 = nn.Sequential(
            nn.Linear(2, 100),
            nn.ReLU(),
            nn.Linear(100, 250),
            nn.ReLU(),
            nn.Linear(250, 500),
        )
        self.layers2 = nn.Sequential(
            nn.LSTM(input_size=500, hidden_size=500, num_layers=2),
        )

        self.layers3 = nn.Sequential(
            nn.Linear(500, 250),
            nn.ReLU(),
            nn.Linear(250, 100),
            nn.ReLU(),
            nn.Linear(100, 4),
        )

        # self.ce = nn.CrossEntropyLoss()

    def forward(self, x):
        out = self.layers1(x)
        out = out.unsqueeze(0)
        out = out.unsqueeze(0)
        out = self.layers2(out)
        out = self.layers3(out[0])
        out = out.squeeze(0)
        out = out.squeeze(0)
        return out

    # def training_step(self, batch, batch_idx):
    #     x, y = batch
    #     x = x.view(x.size(0), -1)
    #     y_hat = self.layers(x)
    #     loss = self.ce(y_hat, y)
    #     self.log('train_loss', loss)
    #     return loss

    # def configure_optimizers(self):
    #     optimizer = torch.optim.Adam(self.parameters(), lr=1e-4)
    #     return optimizer
