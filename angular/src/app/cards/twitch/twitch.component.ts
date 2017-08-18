import { Component, ViewChild } from '@angular/core';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { CardComponent } from '../_base/card.component';
import { TwitchService } from './twitch.service';
import { ITwitchData, ITwitchResponse } from './twitch.interface';
import { bounceChildrenFromLeft } from 'app/shared/animations';

@Component({
  selector: 'dd-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['../_base/card.component.scss', './twitch.component.scss'],
  providers: [TwitchService],
  animations: [bounceChildrenFromLeft(100)]
})
export class TwitchComponent extends CardComponent {
  CARD_DEFINITION_ID  = 4;

  public hiddenTwitchStreams = new Array<ITwitchData>();
  public displayedTwitchStreams = new Array<ITwitchData>();

  constructor(public sharedApp: SharedApp, private twitchService: TwitchService) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getAllTwitchStreams();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getAllTwitchStreams() {
    this.twitchService.getTopStreams().then((response: ITwitchResponse) => {
      this.parseTwitchResponse(response);
    }).catch((error) => {
      this.sharedApp.showError("Error getting Twitch data", error);
    });
  }

  parseTwitchResponse(response: ITwitchResponse) {
    this.hiddenTwitchStreams = new Array<ITwitchData>();
    for (let i = 0; i < response.streams.length; i++) {
      let streamData = response.streams[i];
      let parsedTwitchStream = {
        followers: streamData.channel.followers,
        previewImageUrl: streamData.preview.medium,
        streamTitle: streamData.channel.status,
        streamUrl: streamData.channel.url,
        streamer: streamData.channel.display_name,
        viewers: streamData.viewers
      };

      if (i < 6)
        this.displayedTwitchStreams.push(parsedTwitchStream);
      else
        this.hiddenTwitchStreams.push(parsedTwitchStream);

    }
  }

  loadMore() {
    for (let i = 0; this.hiddenTwitchStreams.length > 0 && i < 6; i++) {
      this.displayedTwitchStreams.push(this.hiddenTwitchStreams.shift());
    }
  }
}