const reviewTemplate = {
    author: '',
    percentRating: 0,
    reviewText: '',
    toHtml: function() {
      return `<table style="width:160px">
      <hr>
      <tr style="width:50px">
        <th>
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