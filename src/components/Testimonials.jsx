import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const Testimonials = () => {
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  const testimonials = [
    {
      id: 1,
      quote: "Tempus oncu enim pellen tesque este pretium in neque, elit morbi sagittis lorem habi mattis Pellen tesque pretium feugiat vel morbi suspen dise sagittis lorem habi tasse morbi.",
      rating: 3.5,
      author: "Emma Chamberlin"
    },
    {
      id: 2,
      quote: "A blog is a digital publication that can complement a website or exist independently. A blog may include articles, short posts, listicles, infographics, videos, and other digital content.",
      rating: 3.5,
      author: "Jennie Rose"
    }
  ]

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="star star-fill">
          <use xlinkHref="#star-fill"></use>
        </svg>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="star star-half">
          <use xlinkHref="#star-half"></use>
        </svg>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="star star-empty">
          <use xlinkHref="#star-empty"></use>
        </svg>
      )
    }

    return stars
  }

  return (
    <section id="testimonials" className="position-relative">
      <div className="container">
        <div className="row">
          <div className="review-content position-relative">
            <div ref={prevRef} className="swiper-icon swiper-arrow swiper-arrow-prev position-absolute d-flex align-items-center">
              <svg className="chevron-left">
                <use xlinkHref="#chevron-left" />
              </svg>
            </div>
            <Swiper
              className="testimonial-swiper"
              modules={[Navigation]}
              loop={true}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current
                swiper.params.navigation.nextEl = nextRef.current
              }}
            >
              <div className="quotation text-center">
                <svg className="quote">
                  <use xlinkHref="#quote" />
                </svg>
              </div>
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id} className="text-center d-flex justify-content-center">
                  <div className="review-item col-md-10">
                    <i className="icon icon-review"></i>
                    <blockquote>"{testimonial.quote}"</blockquote>
                    <div className="rating">
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="author-detail">
                      <div className="name text-dark text-uppercase pt-2">{testimonial.author}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div ref={nextRef} className="swiper-icon swiper-arrow swiper-arrow-next position-absolute d-flex align-items-center">
              <svg className="chevron-right">
                <use xlinkHref="#chevron-right" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="swiper-pagination"></div>
    </section>
  )
}

export default Testimonials

