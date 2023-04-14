/* Include the controller definition */
#include "footbot_diffusion.h"
/* Function definitions for XML parsing */
#include <argos3/core/utility/configuration/argos_configuration.h>
/* 2D vector definition */
#include <argos3/core/utility/math/vector2.h>

#include <argos3/core/utility/networking/tcp_socket.h>
#include <sstream>
#include <argos3/core/control_interface/ci_sensor.h>
#include <argos3/plugins/robots/generic/control_interface/ci_positioning_sensor.h>

#include <argos3/core/simulator/entity/entity.h>
#include <argos3/plugins/simulator/entities/cylinder_entity.h>
#include <argos3/plugins/robots/foot-bot/control_interface/ci_footbot_proximity_sensor.h>
#include <string>

#include <argos3/core/simulator/simulator.h>
#include <argos3/core/simulator/entity/embodied_entity.h>
#include <argos3/core/simulator/entity/controllable_entity.h>
#include <argos3/core/utility/logging/argos_log.h>

#include <argos3/core/simulator/space/space.h>
#include <argos3/core/simulator/entity/floor_entity.h>

CFootBotDiffusion::CFootBotDiffusion() : m_pcWheels(NULL),
                                         m_pcProximity(NULL),
                                         m_cAlpha(10.0f),
                                         m_fDelta(0.5f),
                                         m_fWheelVelocity(2.5f),
                                         m_cGoStraightAngleRange(-ToRadians(m_cAlpha),
                                                                 ToRadians(m_cAlpha)) {}

/****************************************/
/****************************************/

void CFootBotDiffusion::Init(TConfigurationNode &t_node)
{

   m_pcWheels = GetActuator<CCI_DifferentialSteeringActuator>("differential_steering");
   m_pcProximity = GetSensor<CCI_FootBotProximitySensor>("footbot_proximity");
   m_pcPosSensor = GetSensor<CCI_PositioningSensor>("positioning");

   GetNodeAttributeOrDefault(t_node, "alpha", m_cAlpha, m_cAlpha);
   m_cGoStraightAngleRange.Set(-ToRadians(m_cAlpha), ToRadians(m_cAlpha));
   GetNodeAttributeOrDefault(t_node, "delta", m_fDelta, m_fDelta);
   GetNodeAttributeOrDefault(t_node, "velocity", m_fWheelVelocity, m_fWheelVelocity);
   m_cSocket.Connect("localhost", 1234);
}

/****************************************/
/****************************************/

void CFootBotDiffusion::ControlStep()
{

   const CCI_FootBotProximitySensor::TReadings &tProxReads = m_pcProximity->GetReadings();
   const CVector3 &cPos = m_pcPosSensor->GetReading().Position;
   /* Sum them together */
   CVector2 cAccumulator;
   for (size_t i = 0; i < tProxReads.size(); ++i)
   {
      cAccumulator += CVector2(tProxReads[i].Value, tProxReads[i].Angle);

      if (tProxReads[i].Value > 0)
      {
         if (cPos.GetX() >= 0.25f && cPos.GetX() <= 0.75f && cPos.GetY() >= 0.25f && cPos.GetY() <= 0.75f) {
         std::string message = "|,Landmark 1," + std::to_string(cPos.GetX()) + "," + std::to_string(cPos.GetY()) + "," + GetId() + ",|";
         CByteArray byteArray(reinterpret_cast<const UInt8 *>(message.c_str()), message.size());
         m_cSocket.SendMsg(byteArray);
         }
         else if (cPos.GetX() <= -0.25f && cPos.GetX() >= -0.75f && cPos.GetY() >= 0.25f && cPos.GetY() <= 0.75f) {
         std::string message = "|,Landmark 2," + std::to_string(cPos.GetX()) + "," + std::to_string(cPos.GetY()) + "," + GetId()+ ",|";
         CByteArray byteArray(reinterpret_cast<const UInt8 *>(message.c_str()), message.size());
         m_cSocket.SendMsg(byteArray);
         }
      }
   }
   cAccumulator /= tProxReads.size();
   /* If the angle of the vector is small enough and the closest obstacle
    * is far enough, continue going straight, otherwise curve a little
    */
   CRadians cAngle = cAccumulator.Angle();
   if (m_cGoStraightAngleRange.WithinMinBoundIncludedMaxBoundIncluded(cAngle) &&
       cAccumulator.Length() < m_fDelta)
   {
      /* Go straight */
      m_pcWheels->SetLinearVelocity(m_fWheelVelocity, m_fWheelVelocity);
   }
   else
   {
      /* Turn, depending on the sign of the angle */
      if (cAngle.GetValue() > 0.0f)
      {
         m_pcWheels->SetLinearVelocity(m_fWheelVelocity, 0.0f);
      }
      else
      {
         m_pcWheels->SetLinearVelocity(0.0f, m_fWheelVelocity);
      }
   }
}

REGISTER_CONTROLLER(CFootBotDiffusion, "footbot_diffusion_controller")
