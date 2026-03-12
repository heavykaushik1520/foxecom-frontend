import React from 'react'
import singleImage1 from '../assest/images/single-image1.png'

const YearlySale = () => {
  return (
    <section 
      id="yearly-sale" 
      className="bg-light-blue overflow-hidden mt-5 padding-xlarge" 
      style={{
        backgroundImage: `url(${singleImage1})`,
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="row d-flex flex-wrap align-items-center">
        <div className="col-md-6 col-sm-12">
          <div className="text-content offset-4 padding-medium">
            <h3>10% off</h3>
            <h2 className="display-2 pb-5 text-uppercase text-dark">New year sale</h2>
          </div>
        </div>
        <div className="col-md-6 col-sm-12">
          
        </div>
      </div>
    </section>
  )
}

export default YearlySale

