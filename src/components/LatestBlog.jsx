import React from 'react'
import postItem1 from '../assest/images/post-item1.jpg'
import postItem2 from '../assest/images/post-item2.jpg'
import postItem3 from '../assest/images/post-item3.jpg'

const LatestBlog = () => {
  const posts = [
    {
      id: 1,
      image: postItem1,
      date: 'feb 22, 2023',
      category: 'Gadgets',
      title: "Get some cool gadgets in 2023"
    },
    {
      id: 2,
      image: postItem2,
      date: 'feb 25, 2023',
      category: 'Technology',
      title: "Technology Hack You Won't Get"
    },
    {
      id: 3,
      image: postItem3,
      date: 'feb 22, 2023',
      category: 'Camera',
      title: "Top 10 Small Camera In The World"
    }
  ]

  return (
    <section id="latest-blog" className="padding-large">
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between pb-3">
            <h2 className="display-7 text-dark text-uppercase">Latest Posts</h2>
            <div className="btn-right">
              <a href="blog.html" className="btn btn-medium btn-normal text-uppercase">Read Blog</a>
            </div>
          </div>
          <div className="post-grid d-flex flex-wrap justify-content-between">
            {posts.map((post) => (
              <div key={post.id} className="col-lg-4 col-sm-12">
                <div className="card border-none me-3">
                  <div className="card-image">
                    <img
                      src={post.image}
                      alt=""
                      className="img-fluid"
                      loading="lazy"
                      width="600"
                      height="400"
                    />
                  </div>
                </div>
                <div className="card-body text-uppercase">
                  <div className="card-meta text-muted">
                    <span className="meta-date">{post.date}</span>
                    <span className="meta-category">- {post.category}</span>
                  </div>
                  <h3 className="card-title">
                    <a href="#">{post.title}</a>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LatestBlog

