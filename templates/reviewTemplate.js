const reviewTemplate = {
    author: '',
    percentRating: 0,
    reviewText: '',
    toHtml: function() {
      return `<table style="width:260px">
      <hr>
      <tr style="width:50px">
        <th style="width:50px">
          <div class="star-ratings-sprite">
            <span style="width:${this.percentRating}%" class="star-ratings-sprite-rating"></span>
          </div>
        </th>
        <th> &nbsp by ${this.author}</th>
      </tr>
    </table>
  
    <table align="right"> 
      <tr>
        <i>${this.reviewText}</i>
      </tr>
      
    </table>`
    }
  }

exports.reviewTemplate = reviewTemplate;