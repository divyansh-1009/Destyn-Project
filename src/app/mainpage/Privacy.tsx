import React from "react";

export default function Privacy({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(5px)",
        zIndex: 2000,
        overflowY: "auto",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#111",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          border: "1px solid #333",
          color: "#fff",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            borderRadius: "8px",
            color: "#888",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px 12px",
            transition: "all 0.2s",
            zIndex: 10,
            float: "right",
            marginBottom: "20px",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = "#888";
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Privacy Policy
          </h1>
          <h2 
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: "24px 0 8px 0",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
          >
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#ccc",
          }}
        >
          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              1. Where This Privacy Policy Applies
            </h2>
            
            <p>
              This Privacy Policy applies to websites, apps, events and other services we operate under the brand. Whether you're searching for your soulmate, joining us at one of our events, or using any of our other awesome services, this Policy has got you covered. For simplicity, we just refer to all of these as our "service" in this Privacy Policy.
            </p>
            <p style={{ marginTop: "12px" }}>
              If for some reason, one of our services requires its own separate privacy policy, then that policy will be made available to you and that policy -- not this Privacy Policy -- will apply.
            </p>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "12px 0"
          }} />

          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              2. Data We Collect
            </h2>
            
            <p>
              It goes without saying, we can't help you develop meaningful connections without you providing some information about yourself, like basic profile details and the types of people you'd like to meet. Using our service also generates some information, such as when you logged in and how you used the service. We may also collect data from third parties, like when you access the service through an account you have on another platform (e.g., Facebook, Google, or Apple) or when you upload information from your account on another platform to complete your profile. If you're interested in all the details, be sure to check out the table below.
            </p>

            <div style={{ marginTop: "24px", overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                fontSize: "14px",
                color: "#ccc",
                border: "1px solid #333"
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      padding: "16px", 
                      textAlign: "left", 
                      borderBottom: "2px solid #333",
                      background: "rgba(102, 126, 234, 0.1)",
                      color: "#fff",
                      width: "30%"
                    }}>
                      DATA YOU GIVE US
                    </th>
                    <th style={{ 
                      padding: "16px", 
                      textAlign: "left", 
                      borderBottom: "2px solid #333",
                      background: "rgba(102, 126, 234, 0.1)",
                      color: "#fff",
                      width: "70%"
                    }}>
                      DESCRIPTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0"
                    }}>
                      Account Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top"
                    }}>
                      When you create an account, you provide us with basic information to set up your account, including your phone number, name, email address, and date of birth.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      Profile Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      When you complete your profile, you share additional details about yourself, such as your gender, interests, and preferences. Some of this data may be considered sensitive or special in certain countries, such as details about sexual orientation, sexual life, health, racial or ethnic origins, religious beliefs, or political affiliations. If you choose to provide this data, you consent to us using it as laid out in this Privacy Policy.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0"
                    }}>
                      Content
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top"
                    }}>
                      When you use our service, you may post photos, videos, audio, text and other types of content, such as your chats with other members.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      Marketing, Survey and Research Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      We sometimes run (i) surveys, focus groups, or market studies for research purposes and (ii) promotions, events or contests for marketing purposes. When you choose to participate, you give us information to process your entry and participation, as well as your responses to our questions and your feedback.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0"
                    }}>
                      Third-Party Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top"
                    }}>
                      When you choose to share with us information about other people (for example, if you use the contact details of someone you know for a given feature or if you submit a query or report involving a member), we process this data on your behalf to complete your request.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      Customer Support Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      verticalAlign: "top",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      When you contact us, you provide us with information that may be necessary to help address your enquiry. Other people may also submit queries or reports involving you. Finally, our moderation tools and teams can collect additional data as part of their investigations. Further, we are part of Destyn. We consider the safety and security of members a top priority. If you were banned from Destyn, your data may be shared with us to allow us to take necessary actions, including closing your account or preventing you from creating an account on our service. Where legally allowed, we can also receive information about suspected or convicted bad actors from third parties as part of our efforts to ensure our members' safety and security.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "32px", overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                fontSize: "14px",
                color: "#ccc",
                border: "1px solid #333"
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      padding: "16px", 
                      textAlign: "left", 
                      borderBottom: "2px solid #333",
                      background: "rgba(102, 126, 234, 0.1)",
                      color: "#fff",
                      width: "30%"
                    }}>
                      DATA GENERATED OR AUTOMATICALLY COLLECTED
                    </th>
                    <th style={{ 
                      padding: "16px", 
                      textAlign: "left", 
                      borderBottom: "2px solid #333",
                      background: "rgba(102, 126, 234, 0.1)",
                      color: "#fff",
                      width: "70%"
                    }}>
                      DESCRIPTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0"
                    }}>
                      Usage Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top"
                    }}>
                      Using the service generates data about your activity, including how you use it (e.g., when you logged in, features you've been using, actions taken, information shown to you, referring webpages, ads you interacted with) and how you interact with others (e.g., searching, matching, communicating). We may also receive data related to interactions you have had with our ads on third-party websites or apps.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      Technical Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      verticalAlign: "top",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      Using the service involves the collection of data from and about the device(s) you use to access our service, including hardware and software information such as IP address, device ID and type, apps settings and characteristics, app crashes, advertising IDs and identifiers associated with cookies or other technologies that may uniquely identify a device or browser. For more information about cookies, see our cookie policy.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ marginTop: "32px", overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                fontSize: "14px",
                color: "#ccc",
                border: "1px solid #333"
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      padding: "16px", 
                      textAlign: "left", 
                      borderBottom: "2px solid #333",
                      background: "rgba(102, 126, 234, 0.1)",
                      color: "#fff",
                      width: "30%"
                    }}>
                      OTHER DATA WE COLLECT WITH YOUR PERMISSION
                    </th>
                    <th style={{ 
                      padding: "16px", 
                      textAlign: "left", 
                      borderBottom: "2px solid #333",
                      background: "rgba(102, 126, 234, 0.1)",
                      color: "#fff",
                      width: "70%"
                    }}>
                      DESCRIPTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0"
                    }}>
                      Geolocation Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top"
                    }}>
                      If you permit us, we can collect your geolocation (latitude and longitude) from your device. If you decline permission, features that rely on precise geolocation may not be available to you.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      Face Geometry Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid #333",
                      verticalAlign: "top",
                      background: "rgba(0, 0, 0, 0.2)"
                    }}>
                      You may choose to participate in certain of our features, like Selfie Verification, that involve the collection of face geometry data, which may be considered biometric data in some jurisdictions. Learn more about our verification feature and how we process your face geometry data.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: "16px", 
                      verticalAlign: "top",
                      fontWeight: "600",
                      color: "#e0e0e0"
                    }}>
                      ID Data
                    </td>
                    <td style={{ 
                      padding: "16px", 
                      verticalAlign: "top"
                    }}>
                      You may provide us with a copy of your government-issued ID to help us check that you're who you say you are.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                4. Why and How We Use Your Data
              </h2>
              
              <p>
                The main reason we process your data is to provide our service to you and improve it over time. That includes connecting you with members who might make your heart skip a beat, personalizing your experience, and just helping you make the most of our service. We also process your data to keep you and all of our members safe and secure while using our service. We take this responsibility very seriously and we're always working to improve our systems and processes to help protect you. And yes, we may process your data to show relevant ads – you cannot control this in your settings. Read on for a more detailed explanation.
              </p>
              
              <p style={{ marginTop: "12px" }}>
                For information on how we process personal data through "profiling" and "automated decision-making", please see our FAQs.
              </p>

              <div style={{ marginTop: "32px", overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  fontSize: "14px",
                  color: "#ccc",
                  border: "1px solid #333"
                }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        padding: "16px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #333",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#fff",
                        width: "33%"
                      }}>
                        PURPOSES FOR PROCESSING YOUR DATA
                      </th>
                      <th style={{ 
                        padding: "16px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #333",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#fff",
                        width: "33%"
                      }}>
                        GROUNDS FOR PROCESSING YOUR DATA
                      </th>
                      <th style={{ 
                        padding: "16px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #333",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#fff",
                        width: "34%"
                      }}>
                        CATEGORIES OF DATA PROCESSED
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>To enable you to use our service, including:</p>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Creating and maintaining your account and profile on our service</li>
                          <li style={{ marginBottom: "6px" }}>Operating and maintaining the various features on our service</li>
                          <li style={{ marginBottom: "6px" }}>Recommending other members to you and recommending you to them</li>
                          <li style={{ marginBottom: "6px" }}>Organizing sweepstakes and contests</li>
                          <li style={{ marginBottom: "6px" }}>Responding to your requests and questions</li>
                          <li>Monitoring the well-functioning of our service and troubleshooting and fixing issues as needed</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Performance of our contract with you</li>
                          <li>Your consent (where sensitive data or other types of data that require consent is processed)</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Account Data</li>
                          <li style={{ marginBottom: "6px" }}>Profile Data</li>
                          <li style={{ marginBottom: "6px" }}>Content</li>
                          <li style={{ marginBottom: "6px" }}>Purchase Data</li>
                          <li style={{ marginBottom: "6px" }}>Marketing, Survey and Research Data</li>
                          <li style={{ marginBottom: "6px" }}>Third Party Data</li>
                          <li style={{ marginBottom: "6px" }}>Customer Support Data</li>
                          <li style={{ marginBottom: "6px" }}>Social Media Data</li>
                          <li style={{ marginBottom: "6px" }}>Usage Data</li>
                          <li style={{ marginBottom: "6px" }}>Technical Data</li>
                          <li>Geolocation Data</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>To enable your purchases on our service, including:</p>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Processing payments</li>
                          <li>Offering discounts and promotions, customizing prices</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li>Performance of our contract with you</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Account Data</li>
                          <li style={{ marginBottom: "6px" }}>Profile Data</li>
                          <li style={{ marginBottom: "6px" }}>Technical Data</li>
                          <li style={{ marginBottom: "6px" }}>Purchase Data</li>
                          <li>Usage Data</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>To operate advertising and marketing campaigns, including:</p>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Performing and measuring the effectiveness of advertising campaigns run on our service</li>
                          <li style={{ marginBottom: "6px" }}>Performing and measuring the effectiveness of marketing campaigns promoting our own service on third-party platforms</li>
                          <li>Communicating with you about products and services we believe may interest you</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Consent (where required under applicable law) and otherwise our legitimate interest.</li>
                          <li>It is in our legitimate interest to promote our service and to show ads to our members which are tailored to their interests, as a way to improve their experience and help fund the parts of our service which are free</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Account Data</li>
                          <li style={{ marginBottom: "6px" }}>Profile Data</li>
                          <li style={{ marginBottom: "6px" }}>Usage Data</li>
                          <li style={{ marginBottom: "6px" }}>Marketing, Survey and Research Data</li>
                          <li>Technical Data</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>To improve our service and create new features and services, including:</p>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Running focus groups, market studies, and surveys</li>
                          <li style={{ marginBottom: "6px" }}>Analyzing how our service is used</li>
                          <li style={{ marginBottom: "6px" }}>Reviewing interactions with customer care teams to improve service quality</li>
                          <li style={{ marginBottom: "6px" }}>Developing and improving new features and services, including through machine learning and other technologies, and testing them out</li>
                          <li>Conducting research and publishing research papers</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Performance of our contract with you</li>
                          <li style={{ marginBottom: "6px" }}>Our legitimate interest: It is in our legitimate interest to improve our service over time</li>
                          <li>Consent where required under applicable law (e.g., we may process data deemed sensitive or special in certain area to help make sure that the various communities using our service are being treated fairly and equitably and that our service remains diverse and inclusive)</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Account Data</li>
                          <li style={{ marginBottom: "6px" }}>Profile Data</li>
                          <li style={{ marginBottom: "6px" }}>Content</li>
                          <li style={{ marginBottom: "6px" }}>Purchase Data</li>
                          <li style={{ marginBottom: "6px" }}>Marketing, Survey and Research Data</li>
                          <li style={{ marginBottom: "6px" }}>Third Party Data</li>
                          <li style={{ marginBottom: "6px" }}>Customer Support Data</li>
                          <li style={{ marginBottom: "6px" }}>Social Media Data</li>
                          <li style={{ marginBottom: "6px" }}>Usage Data</li>
                          <li style={{ marginBottom: "6px" }}>Technical Data</li>
                          <li>Geolocation Data</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>To keep you and other members safe on our service and across Destyn, including:</p>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Preventing, detecting, and fighting against violations of our Terms, fraud, and other illegal or unauthorized activities</li>
                          <li style={{ marginBottom: "6px" }}>Developing and improving tools to prevent, detect, and fight against violations of our Terms, fraud, and other illegal or unauthorized activities</li>
                          <li style={{ marginBottom: "6px" }}>Preventing recurrences, notably by preventing individuals who violate our Terms from creating a new account</li>
                          <li style={{ marginBottom: "6px" }}>Letting individuals who submit a report know what we've done about it</li>
                          <li>Verifying your identity</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Performance of our contract with you</li>
                          <li style={{ marginBottom: "6px" }}>Our legitimate interest: It is in our legitimate interest and that of our members to keep them safe</li>
                          <li style={{ marginBottom: "6px" }}>Protection of your vital interests and that of other members</li>
                          <li style={{ marginBottom: "6px" }}>Compliance with legal obligations that apply to us, such as taking down illicit content</li>
                          <li>Your consent (where sensitive data or other type of data that requires consent is processed)</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Account Data</li>
                          <li style={{ marginBottom: "6px" }}>Profile Data</li>
                          <li style={{ marginBottom: "6px" }}>Content</li>
                          <li style={{ marginBottom: "6px" }}>Purchase Data</li>
                          <li style={{ marginBottom: "6px" }}>Third Party Data</li>
                          <li style={{ marginBottom: "6px" }}>Customer Support Data</li>
                          <li style={{ marginBottom: "6px" }}>Usage Data</li>
                          <li style={{ marginBottom: "6px" }}>Technical Data</li>
                          <li style={{ marginBottom: "6px" }}>Face Geometry Data</li>
                          <li>ID Data</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>To comply with applicable law, establish, exercise, and defend legal claims & rights, including:</p>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Preserving data to comply – and evidence compliance – with applicable law</li>
                          <li style={{ marginBottom: "6px" }}>Supporting investigations and defending potential or ongoing litigation, regulatory action or dispute</li>
                          <li style={{ marginBottom: "6px" }}>Responding to lawful requests from law enforcement, courts, regulators, and other third parties</li>
                          <li style={{ marginBottom: "6px" }}>Reporting illegal or infringing content to law enforcement, government or other authorities</li>
                          <li style={{ marginBottom: "6px" }}>Establishing, exercising, or defending ongoing or threatened claims</li>
                          <li>Sharing data with law enforcement or partners to combat abusive or illegal behavior</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li style={{ marginBottom: "6px" }}>Our legitimate interest: It is in our legitimate interest to comply with applicable law and protect ourselves, our members and others, including as part of investigations, legal proceedings, and other disputes</li>
                          <li style={{ marginBottom: "6px" }}>Protection of your vital interests and that of other members</li>
                          <li>Compliance with legal obligations applying to us, such as responding to law enforcement requests for information</li>
                        </ul>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <ul style={{ paddingLeft: "20px", margin: "0" }}>
                          <li>None</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                5. How We Share Data
              </h2>
              
              <p>
                Since our goal is to help you make meaningful connections, some of your information is of course visible to other members on the service.
              </p>
            </section>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                6. Your Rights
              </h2>
              
              <p>
                We want you to be in control of your data, so we want to remind you of the following rights, options and tools available to you.
              </p>

              <div style={{ marginTop: "32px", overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  fontSize: "14px",
                  color: "#ccc",
                  border: "1px solid #333"
                }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        padding: "16px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #333",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#fff",
                        width: "50%"
                      }}>
                        YOUR RIGHTS
                      </th>
                      <th style={{ 
                        padding: "16px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #333",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#fff",
                        width: "50%"
                      }}>
                        HOW TO EXERCISE IT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>Access, Portability or To Know</p>
                        <p style={{ margin: "0" }}>Right to be informed of the personal data we process about you and/or ask for a copy of it</p>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ margin: "0" }}>You can access and review some data directly by logging into your account.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>Rectification or Correction</p>
                        <p style={{ margin: "0" }}>Right to amend or update your data where it's inaccurate or incomplete</p>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ margin: "0" }}>You can update your data directly within the service by simply updating your profile.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>Deletion or Erasure</p>
                        <p style={{ margin: "0" }}>Right to delete personal data</p>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <p style={{ margin: "0" }}>You can delete some of the data you provided us directly within the service. You can also close your account as explained, and we'll delete your data as laid out in this Privacy Policy.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ fontWeight: "600", color: "#e0e0e0", marginBottom: "8px" }}>Objection (Opt-out) or Restriction</p>
                        <p style={{ margin: "0" }}>Right to object to us processing personal data or to request that we temporarily or permanently stop processing personal data</p>
                      </td>
                      <td style={{ 
                        padding: "16px", 
                        borderBottom: "1px solid #333",
                        verticalAlign: "top",
                        background: "rgba(0, 0, 0, 0.2)"
                      }}>
                        <p style={{ margin: "0" }}>You can directly opt-out from certain of your data processing in your account settings. you wish to object to or restrict the data.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style={{ marginTop: "24px" }}>
                For your protection and the protection of all of our members, we may ask you for information to verify your identity or authority to act on behalf of a member before we can answer the above requests. We wouldn't want someone else to get in control of your data!
              </p>

              <p style={{ marginTop: "16px" }}>
                Keep in mind, we may reject requests, including if we are unable to authenticate you, if the request is unlawful or invalid, or if it may infringe on trade secrets or intellectual property or the privacy or other rights of someone else. If you wish to receive information relating to another member, such as a copy of any messages you received from them, the other member will have to make a request themselves.
              </p>
            </section>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                7. How Long Do We Retain Your Data
              </h2>
              
              <p>
                We want the connections you make through our service to last forever, but we keep your personal data only as long as necessary for legitimate business reasons (as laid out in Section 4) and as permitted by applicable law.
              </p>

              <p style={{ marginTop: "16px" }}>
                If you decide to stop using our service, you can close your account, and your profile will no longer be visible to other members.
              </p>

              <p style={{ marginTop: "16px" }}>
                Following account closure, we delete your data as laid out below:
              </p>

              <ol style={{ paddingLeft: "20px", marginTop: "16px" }}>
                <li style={{ marginBottom: "12px" }}>
                  To protect the safety and security of our members, we implement a safety retention window of three months following account closure or up to two years following an account ban. During this period, we keep your data to investigate unlawful or harmful conduct. The retention of data during this safety retention window is based on our legitimate interest as well as that of potential third-party victims.
                </li>
                <li style={{ marginBottom: "12px" }}>
                  We maintain limited data on the basis of our legitimate interest: we keep customer care records and supporting data as well as imprecise location of download/purchase for five years in support of our safety efforts, to support our customer care decisions, enforce our rights and enable us to defend ourselves in the event of a claim, profile data for one year in anticipation of potential litigation, for the establishment, exercise or defence of legal claims, and data necessary to prevent members who were banned from opening a new account for as long as necessary to ensure the safety and vital interests of our members.
                </li>
                <li style={{ marginBottom: "12px" }}>
                  Finally, we maintain data based on our legitimate interest where there is an outstanding or potential issue, claim or dispute requiring us to keep data, in particular if we receive a valid legal subpoena or request asking us to preserve data (in which case we would need to keep the data to comply with our legal obligations) or if data would otherwise be necessary as part of legal proceedings.
                </li>
              </ol>

              <p style={{ marginTop: "16px" }}>
                Where and as legally permitted, we may maintain and use data that, by itself, cannot identify or be attributed specifically to you for the purposes described in this Privacy Policy, including to improve our service and create new features, technologies, and services and keep Destyn services safe.
              </p>
            </section>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                8. Children's Privacy
              </h2>
              
              <p>
                Our service is restricted to individuals who are 18 years of age or older. We do not permit individuals under the age of 18 on our platform. If you suspect that a member is under the age of 18, please use the reporting mechanism available on the service.
              </p>
            </section>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                9. Privacy Policy Changes
              </h2>
              
              <p>
                This policy may change over time. We're always looking for new and innovative ways to help you build meaningful connections and strive to make sure explanations of our data practices remain up-to-date. We will notify you before material changes take effect so that you have time to review the changes.
              </p>
            </section>

            <div style={{ 
              width: "100%", 
              height: "4px",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              borderRadius: "2px",
              margin: "24px 0 12px 0"
            }} />

            <section>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                10. How to Contact Us
              </h2>
              
              <p>
                If you have questions about this Privacy Policy, contact us through feedback option.
              </p>

              <p style={{ marginTop: "24px", fontStyle: "italic", color: "#e0e0e0" }}>
                Well, that's it! You've made it to the end of our Privacy Policy. We hope it was as engaging and clear as we tried to make it. Now, let's get out there and start making some memories! We're excited to be on this journey with you.
              </p>
            </section>

          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              padding: "16px",
              borderTop: "1px solid #333",
            }}
          >
            <p style={{ margin: "0", color: "#888", fontSize: "14px" }}>
              © 2025 Destyn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}