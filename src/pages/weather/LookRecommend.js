import React from 'react';

import LookRecommendMild from './LookRecommendMild';
import LookRecommendChilly from './LookRecommendChilly';
import LookRecommendHotAndHumid from './LookRecommendHotAndHumid';
import LookRecommendHotAndDry from './LookRecommendHotAndDry';
import LookRecommendHotRainy from './LookRecommendHotRainy';
import LookRecommendCold from './LookRecommendCold';
import LookRecommendColdRainy from './LookRecommendColdRainy';

function LookRecommend() {
  //임시 값
  const temp = 24;
  const isRaining = true;
  const humid = 69;
  let ContentComponent;

  if(isRaining)
  {
    if(temp>=10) ContentComponent=LookRecommendHotRainy;
    else ContentComponent=LookRecommendColdRainy;
  }
  else
  {
    if(temp>=23)
    {
        if(humid >= 70) ContentComponent=LookRecommendHotAndHumid;
        else ContentComponent=LookRecommendHotAndDry;
    }
    else if(temp>=15) ContentComponent=LookRecommendMild;
    else if(temp>=5) ContentComponent=LookRecommendChilly;
    else ContentComponent=LookRecommendCold;
  }
  return (
    <div className="LookRecommend">
      <ContentComponent/>
    </div>
  );
}

export default LookRecommend;
