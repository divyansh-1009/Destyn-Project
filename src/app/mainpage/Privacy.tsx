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
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px",
            transition: "color 0.2s",
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
              © 2023-2025 Destyn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}