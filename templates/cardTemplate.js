const cardTemplate = {
    imgSrc: '',
    name: '',
    dexNum: '',
    avgRating: 'No reviews',
    percentRating: 0,
    toHtml: function() {
      return `<card>
        <div class="cardcontainer">
          <img src="pics/${this.name.toLowerCase()}.jpg" alt="${this.name}" align="center" valign="center">
        </div>
        <div class="text">
          <h3>#${this.dexNum}: ${this.name}</h3>
          <table>
            <tr>
                <b>Average Rating:</b>
            <tr>
              <th style="width:50px">
                <div class="star-ratings-sprite">
                  <span style="width:${this.percentRating}%" class="star-ratings-sprite-rating">(3.5)</span>
                </div>
              </th>
              <th><span>(${this.avgRating})</span></th>
            </tr>
          </table>
  
          <br>
  
          <button onclick="window.location.href = '/pokemon/${this.name}';">View ${this.name}</button>
        </div>
      </card>`
    }
  }

exports.cardTemplate = cardTemplate;