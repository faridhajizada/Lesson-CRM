import { useAllCoursesQuery } from "./../../api/coursesApi";
import { useState } from "react";
import { Card, CardGroup, Col, Container, Row } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import Button from "./../Button/Button";
import s from "./Courses.module.scss";
import { loadStripe } from "@stripe/stripe-js";

function Courses() {
  const { data, isLoading } = useAllCoursesQuery();
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleBookClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  // let userId = localStorage.getItem("userId");
  // console.log("userId", userId);

  // let courseId = selectedCourse?.id;
  // console.log("courseId", courseId);

  const makePayment = async () => {
    console.log("makePayment", selectedCourse);
    const stripe = await loadStripe("pk_test_mAu0YX27q4uYAhqiP6LXOFhj");

    const body = {
      // price: selectedCourse.price,
      // title: selectedCourse.title,
      // description: selectedCourse.description,
      userId: localStorage.getItem("userId"),
      
      courseId: selectedCourse._id,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    // const apiUrl = "http://localhost:8089";
    const apiUrl = "http://localhost:8089/api/students/schedule-course";

    // const response = await fetch(`${apiUrl}/create-checkout-session`, {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <div className={s.cards}>
            <CardGroup>
              {isLoading || !data
                ? Array.from({ length: 8 }).map((_, index) => (
                    <Col md={3} sm={6} key={index}>
                      <Card style={{ margin: "10px" }}>
                        <Card.Title style={{ padding: " 10px" }}>
                          Loading...
                        </Card.Title>
                        <Card.Img
                          variant="top"
                          src={"https://picsum.photos/200/200"}
                        />
                      </Card>
                    </Col>
                  ))
                : data.courses.map((lesson, index) => (
                    <Col md={3} sm={6} key={index}>
                      <Card style={{ margin: "10px" }}>
                        <Card.Title style={{ padding: " 10px" }}>
                          {lesson.createdAt.slice(11, 16)} -
                          {lesson.updatedAt.slice(11, 16)}
                        </Card.Title>
                        <div className={s.cardImage}>
                          <Card.Img
                            variant="top"
                            src={lesson.img || "https://picsum.photos/200/200"}
                          />
                          <p className={s.lessonType}>{lesson.price} - Azn</p>
                          <p className={s.lessonName}>{lesson.description}</p>
                        </div>
                        <Card.Body className={s.cardBody}>
                          <Card.Text className={s.cardDesc}>
                            {lesson.title}
                            <Button
                              appearance="white"
                              onClick={() => handleBookClick(lesson)}
                            >
                              Book
                            </Button>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
            </CardGroup>
          </div>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Подтверждение покупки</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedCourse && (
                <>
                  <p>Вы хотите купить курс `{selectedCourse.title}`?</p>

                  <Button appearance="pink" onClick={makePayment}>
                    Agree
                  </Button>
                </>
              )}
            </Modal.Body>
          </Modal>
        </Row>
      </Container>
    </section>
  );
}

export default Courses;
